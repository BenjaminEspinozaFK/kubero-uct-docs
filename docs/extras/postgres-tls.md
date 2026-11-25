# PostgreSQL con TLS

El complemento de PostgreSQL de Kubero no usa TLS. La conexión entre tu backend y el complemento no sale del clúster, así que puedes conectarte sin cifrar (`sslmode=disable`) y dejarlo documentado como decisión del proyecto.

Si tu proyecto exige cifrar la conexión con la base (`sslmode=require` o `sslmode=verify-full`), no basta con cambiar tu código: el TLS lo ofrece el **servidor** de PostgreSQL. En ese caso, en vez del complemento, despliega tu propio PostgreSQL como una **app** de Kubero con la imagen de esta guía.

## Cómo funciona

- La imagen se basa en `postgres:17.6` y es **pública**, como todas las imágenes que usa Kubero. Por eso no lleva certificados ni claves.
- El certificado y la clave del servidor llegan por **variables de entorno** de la app. Al arrancar, la imagen los escribe en `/tmp` y activa TLS.
- Generas tu propia autoridad certificadora (CA). Tu backend usa su certificado público, `ca.crt`, para verificar que se conecta a tu base.
- Las otras apps del pipeline llegan a la base por su servicio interno, **`[nombre-de-app]-kuberoapp`**, en el **puerto `80`**.

## 1. Preparar los archivos

Crea un repositorio (o una carpeta en el tuyo) con estos tres archivos:

::: code-group

```dockerfile [Dockerfile]
# PostgreSQL con TLS para desplegar como app en Kubero.
# La imagen es pública: NO lleva certificados ni claves. Se los pasa Kubero
# por variables de entorno (TLS_CERT_B64 y TLS_KEY_B64) al arrancar.
FROM postgres:17.6

# Los datos van en una subcarpeta del volumen: initdb no acepta una carpeta
# que ya trae archivos (p. ej. lost+found).
ENV PGDATA=/var/lib/postgresql/data/pgdata

# Kubero suele montar la raíz del contenedor como solo lectura y deja /tmp
# para escribir: el socket de PostgreSQL se mueve a /tmp.
RUN rm -rf /var/run/postgresql && ln -s /tmp/postgresql-run /var/run/postgresql

COPY tls-entrypoint.sh /usr/local/bin/tls-entrypoint.sh
RUN chmod 755 /usr/local/bin/tls-entrypoint.sh

EXPOSE 5432
ENTRYPOINT ["tls-entrypoint.sh"]
CMD ["postgres"]
```

```bash [tls-entrypoint.sh]
#!/usr/bin/env bash
# Escribe el certificado y la clave que llegan por variables de entorno y
# arranca PostgreSQL con TLS. Después sigue el entrypoint oficial de la imagen.
set -euo pipefail

TLS_DIR=/tmp/postgresql-tls
RUN_DIR=/tmp/postgresql-run

if [ -z "${TLS_CERT_B64:-}" ] || [ -z "${TLS_KEY_B64:-}" ]; then
  echo "Faltan TLS_CERT_B64 y/o TLS_KEY_B64 (certificado y clave en base64)." >&2
  exit 1
fi

mkdir -p "$TLS_DIR" "$RUN_DIR"
printf '%s' "$TLS_CERT_B64" | base64 -d > "$TLS_DIR/server.crt"
printf '%s' "$TLS_KEY_B64" | base64 -d > "$TLS_DIR/server.key"

# PostgreSQL rechaza una clave que otros usuarios puedan leer
chmod 700 "$TLS_DIR"
chmod 600 "$TLS_DIR/server.key"
chmod 644 "$TLS_DIR/server.crt"
if [ "$(id -u)" = "0" ]; then
  # corriendo como root, el entrypoint oficial baja al usuario postgres
  chown -R postgres:postgres "$TLS_DIR" "$RUN_DIR"
fi
chmod 3775 "$RUN_DIR"

# Con otro comando (p. ej. bash) no se agrega la configuración
if [ "${1:-}" != "postgres" ]; then
  exec docker-entrypoint.sh "$@"
fi

EXTRA=()
# TLS_REQUIRED=true: las conexiones por red sin TLS se rechazan. Dentro del
# contenedor (socket local) se sigue entrando sin contraseña, como en la
# imagen oficial, para que el arranque pueda crear la base.
if [ "${TLS_REQUIRED:-false}" = "true" ]; then
  cat > "$TLS_DIR/pg_hba.conf" <<'EOF'
local   all  all                 trust
host    all  all  127.0.0.1/32   trust
host    all  all  ::1/128        trust
hostssl all  all  all            scram-sha-256
EOF
  chmod 644 "$TLS_DIR/pg_hba.conf"
  [ "$(id -u)" = "0" ] && chown postgres:postgres "$TLS_DIR/pg_hba.conf"
  EXTRA+=(-c hba_file="$TLS_DIR/pg_hba.conf")
fi

exec docker-entrypoint.sh "$@" \
  -c ssl=on \
  -c ssl_cert_file="$TLS_DIR/server.crt" \
  -c ssl_key_file="$TLS_DIR/server.key" \
  -c ssl_min_protocol_version=TLSv1.2 \
  "${EXTRA[@]}"
```

```bash [generar-certificados.sh]
#!/usr/bin/env bash
# Genera una CA propia y el certificado del servidor PostgreSQL para Kubero.
#
# Uso: ./generar-certificados.sh <nombre-app-de-la-base> <pipeline> <fase>
# Ej.: ./generar-certificados.sh mi-db mi-proyecto test
#
# Las otras apps llegan a la base por el servicio interno de Kubero
# "<app>-kuberoapp", así que el certificado se emite para ese nombre.
set -euo pipefail

if [ $# -ne 3 ]; then
  echo "Uso: $0 <nombre-app-de-la-base> <pipeline> <fase>" >&2
  exit 1
fi

APP="$1"
NS="$2-$3"
SVC="$APP-kuberoapp"
OUT="certs-$APP"

if [ -e "$OUT" ]; then
  echo "Ya existe $OUT/. Bórrala o muévela si quieres generar certificados nuevos." >&2
  exit 1
fi
mkdir -p "$OUT"
chmod 700 "$OUT"
cd "$OUT"

# 1. CA propia (ca.key nunca se sube a ningún lado)
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout ca.key -out ca.crt -subj "/CN=$APP CA" 2>/dev/null

# 2. Clave y solicitud del servidor
openssl req -newkey rsa:2048 -nodes \
  -keyout server.key -out server.csr -subj "/CN=$SVC" 2>/dev/null

# 3. Certificado del servidor firmado por la CA, con los nombres internos
cat > server.ext <<EOF
basicConstraints=CA:FALSE
keyUsage=digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:$SVC,DNS:$SVC.$NS,DNS:$SVC.$NS.svc,DNS:$SVC.$NS.svc.cluster.local
EOF
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -days 825 -extfile server.ext -out server.crt 2>/dev/null
rm -f server.csr server.ext ca.srl
chmod 600 ca.key server.key

# 4. Valores para las variables de entorno de Kubero (una sola línea)
base64 -w0 server.crt > TLS_CERT_B64.txt
base64 -w0 server.key > TLS_KEY_B64.txt
chmod 600 TLS_KEY_B64.txt

echo "Listo en $OUT/:"
echo "  ca.crt            -> para las apps que se conectan (es público)"
echo "  TLS_CERT_B64.txt  -> variable TLS_CERT_B64 de la app de la base"
echo "  TLS_KEY_B64.txt   -> variable TLS_KEY_B64 de la app de la base (secreta)"
echo "  ca.key, server.key -> secretos: no los subas al repositorio"
echo
echo "Host para conectarse: $SVC (puerto 80)"
```

:::

Agrega también un `.gitignore` para no subir los certificados por error:

```text [.gitignore]
certs-*/
*.key
*_B64.txt
```

## 2. Generar los certificados

En tu computador, con `openssl` instalado (Linux, macOS o WSL), dale permisos de ejecución al script y ejecútalo con el **nombre que tendrá la app de la base**, el pipeline y la fase:

```bash
chmod +x generar-certificados.sh
./generar-certificados.sh mi-db mi-proyecto test
```

El script crea la carpeta `certs-mi-db/`:

| Archivo | Qué es | Dónde va |
|---|---|---|
| `ca.crt` | Certificado público de tu CA | En el backend, para verificar la base. Puede ir en el repositorio. |
| `TLS_CERT_B64.txt` | Certificado del servidor en base64 | Variable `TLS_CERT_B64` de la app de la base |
| `TLS_KEY_B64.txt` | Clave del servidor en base64 | Variable `TLS_KEY_B64` de la app de la base |
| `ca.key`, `server.key` | Claves privadas | Solo en tu computador. Guárdalas para renovar el certificado. |

::: danger Claves privadas
`ca.key`, `server.key` y `TLS_KEY_B64.txt` no deben quedar en el repositorio ni dentro de la imagen. La imagen es pública: cualquiera podría descargarla y leer lo que tenga adentro.
:::

El certificado se emite para `mi-db-kuberoapp`. Si después cambias el nombre de la app, vuelve a generarlo.

## 3. Publicar la imagen

Construye y publica la imagen en ghcr.io como en [Preparar tu repositorio en GitHub](../despliegue.md#preparar-tu-repositorio-en-github), incluido el último paso, **Hacer pública la imagen**. Kubero no descarga imágenes privadas.

## 4. Crear la app de la base

En el pipeline, crea una app con estos datos:

| Campo | Valor |
|---|---|
| **Nombre** | El mismo que usaste en el script, por ejemplo `mi-db`. |
| **Imagen del contenedor** / **Etiqueta** | Tu imagen, por ejemplo `ghcr.io/mi-usuario/mi-db-tls` y su etiqueta. |
| **Puerto del contenedor** | `5432` |
| **Dominio** | Uno de un solo nivel bajo `inf.uct.cl`, por ejemplo `mi-db-proyecto.inf.uct.cl`. Kubero lo exige, pero no da acceso a la base: PostgreSQL no atiende HTTP. |

En **Variables de entorno**:

| Variable | Valor |
|---|---|
| `POSTGRES_PASSWORD` | Contraseña del usuario `postgres`. |
| `POSTGRES_DB` | (Opcional) Base de datos que se crea al iniciar. |
| `TLS_CERT_B64` | El contenido completo de `TLS_CERT_B64.txt`, en una línea. |
| `TLS_KEY_B64` | El contenido completo de `TLS_KEY_B64.txt`, en una línea. |
| `TLS_REQUIRED` | `true` para rechazar las conexiones sin TLS. Sin esta variable, TLS queda disponible pero no obligatorio. |

En **Volúmenes** agrega uno para los datos (ver [Volúmenes](volumenes.md)):

| Campo | Valor |
|---|---|
| **Nombre** | Por ejemplo `mi-db-data`. |
| **Tamaño** | Por ejemplo `1Gi`. |
| **Ruta de montaje** | `/var/lib/postgresql/data` |
| **Modo de acceso** | **`ReadWriteOnce`** |

::: warning Modo de acceso del volumen
La fila nueva propone `ReadWriteMany`: cámbialo a `ReadWriteOnce`. Con `ReadWriteMany`, al redesplegar Kubero levanta la base nueva antes de apagar la anterior y quedan dos PostgreSQL escribiendo los mismos datos. El modo no se puede cambiar después de creado el volumen: si te equivocas, cambia también el nombre del volumen para que se cree uno nuevo.
:::

En **Configuración avanzada de la aplicación**, revisa que las [Comprobaciones de estado](health-checks.md) sigan **desactivadas**. Son HTTP y PostgreSQL no responde HTTP, así que Kubero reiniciaría la base una y otra vez.

Guarda con **Crear** y espera a que la app quede en ejecución. En **Registros** debe aparecer `database system is ready to accept connections`.

`POSTGRES_PASSWORD` y `POSTGRES_DB` se aplican solo la primera vez que se crea la base en el volumen. Si los cambias después, la base no cambia: modifícala con SQL (por ejemplo `ALTER USER`).

## 5. Conectar el backend

En las variables del backend, usa el servicio interno de la app de la base, el **puerto `80`** y la ruta donde quedará `ca.crt` dentro de la imagen del backend:

~~~env
DATABASE_URL=postgresql://postgres:CONTRASENA_DEL_PROYECTO@mi-db-kuberoapp:80/mi_base?sslmode=verify-full&sslrootcert=/app/certs/ca.crt
~~~

Copia `ca.crt` al repositorio del backend (por ejemplo en `certs/ca.crt`) para que quede dentro de su imagen. Es público, así que puede ir en el repositorio.

Con `sslmode=verify-full`, el backend cifra la conexión y además comprueba que el certificado esté firmado por tu CA y emitido para `mi-db-kuberoapp`. Con `sslmode=require` solo cifra, sin verificar.

Si tu biblioteca no lee `sslmode` ni `sslrootcert` desde la URL, pásale la CA en su configuración. Por ejemplo, con `pg` en Node.js:

~~~javascript
import fs from 'node:fs'
import pg from 'pg'

const pool = new pg.Pool({
  host: 'mi-db-kuberoapp',
  port: 80,
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  database: 'mi_base',
  ssl: { ca: fs.readFileSync('./certs/ca.crt', 'utf8') },
})
~~~

## 6. Comprobar que la conexión usa TLS

Desde el backend, ejecuta esta consulta con la misma conexión que usa tu app:

```sql
select ssl, version from pg_stat_ssl where pid = pg_backend_pid();
```

Debe responder `ssl = t` y una versión como `TLSv1.3`. Con `TLS_REQUIRED=true`, una conexión con `sslmode=disable` debe fallar con `no pg_hba.conf entry ... no encryption`.

| Error | Causa probable |
|---|---|
| `server certificate ... does not match host name` | El host no es `[app]-kuberoapp`, o el certificado se generó con otro nombre de app. |
| `connection refused` o tiempo de espera | Puerto distinto de `80`, o la app de la base no está en ejecución. |
| `password authentication failed` | La contraseña no es la que se usó al crear la base por primera vez. |
| `Faltan TLS_CERT_B64 y/o TLS_KEY_B64` en los registros de la base | Faltan las variables o quedaron vacías. |
| La base se reinicia sola | La comprobación de estado está activada: desactívala. |

## Cuidados

- **Borrar la app borra su volumen y los datos.** Saca respaldos con `pg_dump` antes de cambios grandes.
- **Renovación:** el certificado del servidor dura 825 días. Para renovarlo, genera uno nuevo con la misma CA, actualiza `TLS_CERT_B64` y `TLS_KEY_B64` y reinicia la app.
- **Si pierdes `ca.key`,** no puedes firmar certificados nuevos con esa CA. Genera todo de nuevo y actualiza `ca.crt` en el backend.
- **Si se filtra una clave,** genera certificados nuevos y reemplaza las variables y el `ca.crt` del backend.
