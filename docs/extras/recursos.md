# Recursos

Este panel define el tamaño y la cantidad de pods de una app. Ajusta los recursos según el consumo observado y las opciones habilitadas en el curso.

## Dónde configurarlos

En **Crear app** o **Editar app**, abre **Recursos**. No requiere activar la configuración avanzada.

![Panel de recursos con tamaño del pod, autoescalado y réplicas](../imagenes/app-recursos.png)

## Campos

| Campo | Explicación |
|---|---|
| Tamaño del pod | Perfil disponible con solicitudes y límites de CPU/memoria definidos por la instalación. |
| Autoescalado | Cambia el número de réplicas en función del uso de CPU/memoria y de la configuración del clúster. |
| Réplicas web | Cantidad de pods que sirven la aplicación web. |
| Réplicas worker | Cantidad de pods de trabajo en segundo plano. |
| Rangos web / worker | Mínimo y máximo de réplicas cuando el autoescalado está activo. |

La CPU y memoria se eligen mediante el **perfil de pod**; el formulario actual no ofrece campos numéricos independientes para cambiarlas.

## Pasos y ejemplo

1. Selecciona el tamaño indicado por el profesor.
2. Para una app HTTP sencilla, comienza con **1 réplica web**, **0 worker** y autoescalado desactivado.
3. Guarda y observa CPU/memoria en la tabla del pipeline y en las métricas de la app.
4. Si necesitas autoescalado y el clúster lo admite, actívalo y define, por ejemplo, un rango web **1–3**.
5. Verifica que la app puede ejecutarse en varias réplicas antes de aumentar el rango.

## Limitaciones

Los controles de réplicas y rangos permiten valores **0–10**; las cuotas y capacidad del clúster pueden imponer límites menores. Cero réplicas web deja la app sin pods web. El autoescalado depende de métricas disponibles; activarlo no garantiza un número fijo de pods.

Agregar réplicas no convierte automáticamente una app en un sistema preparado para compartir sesiones o archivos. Revisa [Volúmenes](volumenes.md) antes de escalar servicios con almacenamiento y [Routing y monitoreo](../despliegue.md#monitorear-tu-despliegue) para observar el resultado.


## Recursos de los complementos

Cada complemento (por ejemplo, PostgreSQL) corre en su propio contenedor y tiene sus propios recursos, distintos del tamaño de pod de la app.

- **Reserva** (*request*): lo que el clúster aparta para el complemento.
- **Límite** (*limit*): lo máximo que puede usar. Si supera el límite de memoria, Kubernetes lo reinicia; si supera el de CPU, va más lento.

| Complemento | CPU reservada / límite | Memoria reservada / límite |
|---|---|---|
| PostgreSQL | `50m` / `500m` | `128Mi` / `512Mi` |
| MongoDB, MySQL, RabbitMQ | `100m` / `1` | `256Mi` / `1Gi` |
| Redis | `50m` / `500m` | `64Mi` / `512Mi` |

En PostgreSQL estos valores aparecen en el formulario del complemento y se pueden cambiar **solo al crearlo**: un complemento ya creado no se edita, y para cambiarlos hay que eliminarlo y crearlo de nuevo, lo que borra sus datos. Los demás complementos usan siempre los valores de la tabla.

Los valores por defecto alcanzan para los proyectos del curso. Si en los **Eventos** de la app aparece `OOMKilled` para la base de datos, el límite de memoria quedó corto: consulta al profesor antes de recrearla con un límite mayor.
