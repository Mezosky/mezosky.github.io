---
layout: post
title: "MLOps: Pipelines Productivos 🚰"
date: 2026-03-17
description: Apuntes sobre pipelines productivos, DAGs y Apache Airflow para workflows de machine learning.
tags: [mlops, airflow, teaching, machine-learning]
categories: [machine learning, teaching]
author: Ignacio Meza
slug: mlops-pipelines-productivos
thumbnail: /assets/img/blog/mlops-pipelines/hero.svg
toc:
  beginning: true
---

<section class="blog-note-hero">
  <div class="blog-note-hero-copy">
    <span class="blog-note-kicker">Notion Note</span>
    <p class="blog-note-summary">
      Este post mantiene el mismo espiritu del apunte original: una introduccion a pipelines productivos, DAGs, branching,
      triggers, XCom, variables y buenas practicas para definir tareas en Airflow.
    </p>
    <ul class="blog-note-points">
      <li>Que es un pipeline en machine learning y por que importa en produccion.</li>
      <li>Como pensar un DAG, la ejecucion de dependencias y la paralelizacion.</li>
      <li>Ejemplos concretos con branching, <code>trigger_rule</code>, <code>XCom</code> y idempotencia.</li>
    </ul>
    <a class="blog-note-source" href="https://www.notion.so/92c01b81cb97405288394947dcfdfeb6">Open original note</a>
  </div>
  <div class="blog-note-hero-media">
    <img src="{{ '/assets/img/blog/mlops-pipelines/hero.svg' | relative_url }}" alt="Illustration of an ML pipeline with orchestrated steps">
  </div>
</section>

> Todos los archivos relacionados de codigo a este documento se encuentran en el documento original de Notion.

# Pipelines 🚰

![¿Acaso debo ejecutar mi modelo a mano cada vez que tenga que ejecutarlo?](https://i.redd.it/vzs402uktgm41.gif)

Durante el proceso de desarrollo de Machine Learning, hemos observado que este consta de multiples pasos relevantes. Esta secuencia implica una comprension profunda del problema que deseamos resolver para proponer una estrategia (`score`), recolectar datos de diversas fuentes (`collect data`) y finalmente aplicar una estrategia inteligente que nos permita resolver el problema, tipicamente a traves de un modelo de machine learning (`train model`). Sin embargo, despues de completar estos pasos surge la pregunta: ¿que debo hacer con mi modelo y como puedo asegurarme de que tome decisiones automaticamente? ¿Debo ejecutar manualmente mi modelo? ¿Es necesario monitorear este modelo con el tiempo? Estas preguntas son crucialmente importantes, ya que la mayoria de los cursos de machine learning se centran unicamente en la teoria y no en su aplicacion practica. Sin embargo, una parte fascinante del proceso de MLOps es como desplegamos o ponemos en produccion este modelo.

Una de las formas mas sencillas de desplegar un producto con machine learning es mediante el uso de un contenedor que incluya todas las dependencias necesarias para la ejecucion. Sin embargo, ¿que ocurre cuando existen dependencias que implican la consulta a multiples fuentes de informacion, procesos de refinamiento de datos, automatizacion u otros problemas relacionados con los datos?

De la idea anterior, nos referiremos a un **pipeline** en el contexto del desarrollo de software y machine learning como una secuencia de pasos ordenados y automatizados utilizada para procesar datos, realizar operaciones especificas o aplicar transformaciones a un conjunto de datos o productos. Esencialmente, un pipeline establece un flujo de trabajo estructurado y eficiente, donde cada etapa del proceso se encadena de manera que la salida de una etapa se convierte automaticamente en la entrada de la siguiente.

En general, un simil que podemos hacer con los pipelines productivos es con un director de orquesta. Al igual que un director dirige a los musicos en una sinfonia, un orquestador de pipelines se encarga de coordinar y dirigir diferentes codigos y aplicaciones que hemos escrito. Este sera el encargado de indicar el momento exacto en que cada tarea debe ejecutarse, asegurando asi una sincronizacion precisa y eficiente. De esta manera, se logra una ejecucion fluida y armoniosa de todos los componentes del sistema, permitiendo que las tareas se completen de manera ordenada y optimizada.

## Representacion de los Pipelines

Debido a que vamos a tener que dirigir un gran numero de procesos, es ideal buscar una representacion que nos permita visualizar la estructura de nuestros pipelines. Una forma simple de exponer cada paso es a traves de una representacion de grafos. La representacion tipica para estos grafos es un DAG (`Directed Acyclic Graph`). En un DAG, cada tarea se representa como un nodo, mientras que las flechas indican las direcciones de las dependencias entre las tareas. Esta visualizacion facilita la comprension de la secuencia y las interdependencias de cada paso en el pipeline, asegurando una ejecucion ordenada y eficiente.

<figure class="blog-note-figure">
  <img src="{{ '/assets/img/blog/mlops-pipelines/dag.svg' | relative_url }}" alt="Diagram of a directed acyclic graph for a machine learning workflow">
  <figcaption>Una misma idea del apunte original, pero guardada localmente para que el post mantenga sus imagenes dentro del repositorio.</figcaption>
</figure>

Es importante notar que el nombre DAG proviene de las siglas en ingles de `Directed Acyclic Graph`, lo cual indica que los grafos que vamos a utilizar son aciclicos, es decir, que no contienen ciclos ni loops. Esto es crucial porque asegura que no se generen bucles infinitos en los procesos. Por lo tanto, al definir esta secuencia de tareas, es fundamental asegurarnos de que no se creen loops en sus procesos, garantizando asi una ejecucion fluida y eficiente del pipeline.

### Ejecucion de un Grafo de Pipelines

Si es nuestra primera vez tratando con grafos, puede resultar confuso entender donde comienzan o como se ejecutaran cada una de las tareas que definimos en ellos. Para clarificar esto, tomemos como ejemplo un proceso simple de procesamiento de datos y entrenamiento de dos modelos.

1. Inicialmente, cada nodo en nuestro pipeline estara en un estado incompleto.
2. Para cada tarea definida, se revisaran las dependencias necesarias.
3. Si un nodo presenta todas sus dependencias completadas, entrara en cola para su ejecucion.
4. La tarea en cola se ejecuta.
5. Se vuelve al paso 2.

En un pipeline de este tipo, el proceso comenzaria desde el nodo inicial, ya que al ejecutarse por primera vez ninguna de las tareas previas deberia estar marcada como completada. Una vez que se complete esta tarea, el pipeline continuaria de manera lineal con los pasos de descarga y procesamiento de datos. Lo interesante ocurre en la etapa de entrenamiento, donde dos tareas que dependen solo del procesamiento de datos pueden ejecutarse en paralelo. Una vez que ambas tareas esten completas, el pipeline podra finalizar ejecutando la identificacion del modelo mas relevante.

Como se puede ver en este tipo de ejemplo, el proceso del pipeline siempre buscara ejecutar primero las tareas que no tengan dependencias. Despues de esto, solo se ejecutaran las tareas cuyas dependencias hayan sido completadas. Un aspecto interesante es que si se generan bifurcaciones, se podra ejecutar codigo en paralelo, aprovechando al maximo el entorno o computadora donde se ejecute el codigo. Finalmente, en el ultimo nodo, el pipeline entregara una respuesta y finalizara su ejecucion para un determinado evento.

> Es importante destacar dos puntos interesantes sobre los pipelines que hemos señalado. Primero, tienen la capacidad de paralelizar tareas, lo que optimiza el uso de recursos y acelera la ejecucion de procesos. Segundo, su representacion visual permite identificar facilmente que proceso se esta ejecutando en un determinado momento o cual ha fallado. Esto contrasta con los scripts, que no ofrecen la misma claridad y capacidad de gestion visual.

# Airflow 🌬️

Apache Airflow es una plataforma de codigo abierto diseñada para crear, programar y monitorear flujos de trabajo (`pipelines`) de manera programatica. Una de las principales caracteristicas de Airflow es la definicion de flujos de trabajo como codigo. Los flujos de trabajo se definen utilizando scripts de Python, lo que facilita su reutilizacion y versionado. Esto permite a los desarrolladores crear y mantener flujos de trabajo complejos de manera eficiente. Ademas, Airflow permite programar la ejecucion de tareas en momentos especificos, con soporte para expresiones cron y otros mecanismos de planificacion, lo que asegura que las tareas se ejecuten segun lo programado.

Airflow tambien ofrece la capacidad de paralelizacion, permitiendo la ejecucion en paralelo de tareas que no tienen dependencias entre si, optimizando asi el tiempo de ejecucion. Su interfaz web proporciona herramientas de monitoreo y gestion visual, donde se pueden visualizar las dependencias entre tareas, ver el estado de ejecucion en tiempo real y gestionar los flujos de trabajo de manera intuitiva.

Como se menciono al inicio de este documento, los pipelines productivos pueden ser representados mediante DAGs (`Directed Acyclic Graphs`). Lo interesante es que Airflow nos permite definir estos pipelines utilizando el mismo formato de manera muy **flexible**. Esto se logra mediante la definicion de nuestros pipelines en archivos de Python, donde se especifican las tareas que deseamos ejecutar a traves de un **calendarizador**. El calendarizador se encargara de ejecutar las tareas en el momento adecuado y gestionar las dependencias existentes entre los nodos que hemos definido.

## Branching

<figure class="blog-note-figure">
  <img src="{{ '/assets/img/blog/mlops-pipelines/branching.svg' | relative_url }}" alt="Branching DAG showing two paths and a trigger rule">
  <figcaption>Branching y `trigger_rule` permiten manejar caminos condicionales sin perder claridad en el flujo.</figcaption>
</figure>

```python
start = DummyOperator(task_id='start', dag=dag)

# Function to determinate who branch will be executed
def choose_branch(**kwargs):
    if random.choice([True, False]):
        return 'branch_a'
    else:
        return 'branch_b'

# Branching task
branch_task = BranchPythonOperator(
    task_id='branch_task',
    python_callable=choose_branch,
    provide_context=True,
    dag=dag
)

# Task 2
branch_a = DummyOperator(task_id='branch_a', dag=dag)
# Task 3
branch_b = DummyOperator(task_id='branch_b', dag=dag)

# Task 4
end = DummyOperator(
    task_id='end',
    dag=dag,
    trigger_rule='one_success'
)

start >> branch_task
branch_task >> [branch_a, branch_b]
branch_a >> end
branch_b >> end
```

Del ejemplo, podemos observar varios puntos interesantes. Primero, noten que la estructura de este DAG no es la misma que utilizamos en un primer DAG lineal. Aunque visualmente se ve diferente, a nivel practico no contiene grandes diferencias, por lo que se presenta como un metodo alternativo.

En cuanto a la creacion de nuestras tareas, podemos ver que no hay cambios drasticos en ellas; son tareas simples como las que ya hemos visto. El factor distintivo es la aparicion del `BranchOperator` en el codigo, que cumple el rol de entregar el `task_id` de la tarea que se ejecutara en los siguientes bloques.

> Espera un segundo, tu me habias dicho que las tareas siempre se ejecutaban cuando todas las dependencias previas eran marcadas como exitosas. Si `BranchOperator` selecciona solo una tarea, ¿por que se ejecuta el ultimo bloque?

### Triggers 🔫

En el ejemplo anterior, si inspeccionan el ultimo DAG, podran notar que este posee un nuevo parametro llamado `trigger_rule`. Este parametro permite a Airflow ejecutar la ultima tarea incluso si solo una de las tareas precedentes se ha completado con exito. Gracias a esta configuracion, Airflow puede manejar escenarios mas complejos de dependencias y ejecuciones condicionales.

Los `triggers` son, esencialmente, las condiciones que Airflow aplica a las tareas para determinar si estan listas para ejecutarse, en funcion de sus dependencias. La regla de activacion predeterminada de Airflow es `all_success`, que establece que todas las dependencias de una tarea deben haberse completado con exito antes de que la tarea en si pueda ejecutarse.

Algunas de las reglas de activacion mas comunes son:

- **`all_failed`**: la tarea se ejecuta solo si todas las tareas precedentes fallaron.
- **`one_success`**: la tarea se ejecuta si al menos una de las tareas precedentes se completo con exito.
- **`one_failed`**: la tarea se ejecuta si al menos una de las tareas precedentes fallo.
- **`none_failed`**: la tarea se ejecuta si ninguna de las tareas precedentes fallo, independientemente de si se completaron con exito o no.
- **`none_failed_or_skipped`**: la tarea se ejecuta si ninguna de las tareas precedentes fallo o fue omitida.
- **`all_done`**: la tarea se ejecuta una vez que todas las tareas precedentes se hayan completado, sin importar si tuvieron exito, fallaron o fueron omitidas.

# Mi segunda Pipeline 🚬🗿

![Mi segunda Pipeline](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTdkOTV2ZmpxM2xnbnRrbTE5anFibXU3OWpta25jZ2EweTgzN3VvcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OgHEYtWsv2AXFTBsAy/giphy.gif)

Para esta segunda pipeline, vamos a complejizar un poco mas lo que vimos en el primer ejemplo. Aunque nuestra idea principal sigue siendo la misma (`obtener datos y entregar modelos`), buscaremos crear una canalizacion que consulte tres fuentes de informacion, donde el uso de una de las dos fuentes de datos sera determinado por una fecha en particular. En este caso, escogeremos los datos 1 y 2 para las ejecuciones anteriores a `2024-06-28`, y los datos 1 y 3 para las ejecuciones posteriores.

Ademas, entrenaremos dos modelos y la seleccion del modelo que aceptaremos dependera del desempeño obtenido. El modelo con los valores mas bajos sera eliminado para un determinado periodo. Para lograr esto, utilizaremos una funcionalidad llamada `XCom` y `Airflow Variables`, que nos permitira comunicar la informacion sobre que datos se descargaron y desencadenar el entrenamiento del modelo correspondiente mas tarde.

Comenzamos definiendo el DAG, especificando los siguientes parametros: el ID del DAG, la fecha de inicio, el intervalo de ejecucion y habilitando la opcion de backfilling (`catchup`). Luego, al igual que en el pipeline anterior, definiremos un operador vacio para iniciar el pipeline, el cual se conectara a un `BranchPythonOperator`. Este operador se encargara de seleccionar que dataset descargar en funcion de las fechas de operacion.

```python
with DAG(
    dag_id='my_second_pipeline',
    default_args=args,
    description='MLops pipeline',
    start_date=days_ago(5),
    schedule_interval='@daily',
    catchup=True) as dag:

    # Task 1 - Just a simple print statement
    dummy_task = EmptyOperator(task_id='Start', retries=2)

    # Task 2 - Branch operator
    branch_task_1 = BranchPythonOperator(
        task_id='choose_data_branch',
        python_callable=choose_data_branch,
        provide_context=True,
        dag=dag
    )
```

Como mencionamos al comienzo, se seleccionaran los datasets 1 y 2 si la fecha logica de ejecucion es anterior a `2024-06-28`; de lo contrario, se seleccionaran los datasets 1 y 3. Para lograr esto, necesitaremos generar la siguiente funcion que nos ayudara a seleccionar las proximas tareas. Del codigo, debemos notar que lo que retorna es una lista con los `task_id` que queremos que se ejecuten en los proximos pasos. Por ello, las salidas que definimos aqui deben ser consistentes con los proximos pasos.

Otro punto relevante es el uso de una plantilla de referencia llamada `ds`, que representa la fecha logica de ejecucion del DAG. Ademas, es importante destacar el uso de `XCom`, que se encargara de generar un diccionario con la lista de datasets que fueron descargados. La funcionalidad que nos ofrece `XCom` permite comunicar variables entre diferentes etapas del pipeline, facilitando la coordinacion y transferencia de datos a lo largo de todo el proceso.

```python
def choose_data_branch(ds, **kwargs):
    threshold_date = '2024-06-28'
    ti = kwargs['ti']
    if ds < threshold_date:
        ti.xcom_push(key='data_selected', value=[f"data_1_{ds}", f"data_2_{ds}"])
        return ['download_dataset_1', 'download_dataset_2']
    else:
        ti.xcom_push(key='data_selected', value=[f"data_1_{ds}", f"data_3_{ds}"])
        return ['download_dataset_1', 'download_dataset_3']
```

> Un aspecto relevante en Airflow son los templates de referencia. Utilizando estos templates, podemos acceder facilmente a variables como la fecha de ejecucion, el intervalo de tiempo y otras metricas temporales importantes que nos permiten controlar y monitorear nuestras tareas de manera mas efectiva.
>
> Referencia: <https://airflow.apache.org/docs/apache-airflow/stable/templates-ref.html>

Los siguientes pasos seran la descarga de los diferentes datasets de interes y, posteriormente, la limpieza de estos datos. En estos casos especificos, descargaremos todos los datos con el formato `data_*` de las fuentes definidas.

```python
# Task 3.a
task_download_dataset_1 = BashOperator(
    task_id='download_dataset_1',
    bash_command="curl -o "
    "/root/airflow/data_1_{{ ds }}.csv "
    "https://gitlab.com/imezadelajara/datos_clase_7_mds7202/-/raw/main/airflow_class/data_1.csv"
)

# Task 4.a - Clean the data
task_clean_data_1 = PythonOperator(
    task_id='clean_data_1',
    python_callable=clean_data,
    op_kwargs={'data_name': 'data_1'},
)

# Task 3.b
task_download_dataset_2 = ...
# Task 4.b - Clean the data
task_clean_data_2 = ...

# Task 3.c
task_download_dataset_3 = ...
# Task 4.c - Clean the data
task_clean_data_3 = ...
```

Del codigo podemos notar dos cosas nuevas. La primera es el uso de `ds` para definir el nombre del archivo en la tarea 3.a. La segunda es el uso de un nuevo parametro llamado `op_kwargs`, que se pasa en formato de diccionario y representa los inputs que recibira la funcion de Python que vamos a llamar con el operador.

Para la funcion `clean_data`, esta cambiara ya que debemos definir el uso de inputs que nos ayudaran a identificar el archivo que queremos cargar y limpiar. Otro factor relevante es que, para este ejemplo, no vamos a guardar en memoria local el resultado generado por esta etapa. En su lugar, utilizaremos `Variables` de Airflow.

```python
def clean_data(data_name, ds, **kwargs):
    df = pd.read_csv(f"{data_name}_{ds}.csv", on_bad_lines='skip')
    df = df.drop(columns=['Employee ID'])
    X = df.drop(columns=['Attrition'])
    y = df['Attrition']
    categorical_columns = X.select_dtypes(include=['object']).columns
    df_transformed = pd.get_dummies(X, columns=categorical_columns, drop_first=True)
    df_transformed = pd.concat([df_transformed, y], axis=1)
    df_transformed.to_csv("clean_employee_attrition.csv")
    Variable.set(f"{data_name}_{ds}", df_transformed.to_json())
```

Para la definicion de la tarea 5, vamos a combinar los datos generados en los pasos anteriores. Debido a que siempre habra una rama que no se ejecutara, debemos especificar en el `trigger_rule` que esta tarea se ejecutara siempre que haya al menos una ejecucion exitosa en los pipelines de los cuales depende.

```python
# Task 5 - Join the data
task_join_data = PythonOperator(
    task_id='join_data',
    python_callable=join_data,
    trigger_rule='one_success'
)
```

Para identificar cuales son los datasets que debemos ejecutar, utilizaremos la informacion generada en la tarea 2. Para ello, usaremos `ti.xcom_pull` para obtener la lista, especificando la clave que representa dicha lista y la tarea en la que se genero.

```python
def join_data(**kwargs):
    ti = kwargs['ti']
    variable_keys = ti.xcom_pull(key='data_selected', task_ids='choose_data_branch')
    data_list = []
    for key in variable_keys:
        data = pd.read_json(Variable.get(key))
        data_list.append(data)
    df = pd.concat(data_list, axis=0)
    df.to_csv("clean_employee_attrition.csv")
```

Finalmente, definimos las tareas de entrenamiento y seleccion de modelo:

```python
# Task 6.a - Train a ML Model using LightGBM
task_train_lgbm_model = PythonOperator(
    task_id='ml_train_lgbm',
    python_callable=train_lgbm
)

# Task 6.b - Train a ML Model using Random Forest
task_train_rf_model = PythonOperator(
    task_id='ml_train_rf',
    python_callable=train_random_forest
)

# Task 7 - Choose the best model
choose_best_model_task = PythonOperator(
    task_id='choose_best_model',
    python_callable=choose_best_model,
)
```

En cuanto a las funciones utilizadas para estas tareas, las funciones de entrenamiento deberan guardar los modelos entrenados en una ruta local utilizando `joblib`. Tanto la ruta donde se guardo el modelo como la precision (`accuracy`) obtenida deben informarse mediante `XCom` para, mas tarde, poder seleccionar el mejor modelo.

```python
def train_random_forest(ds, **kwargs):
    ti = kwargs['ti']
    # Load the cleaned data
    df = pd.read_csv("clean_employee_attrition.csv", index_col=0, on_bad_lines='skip')
    X_train, X_test, y_train, y_test = train_test_split(
        df.drop('Attrition', axis=1), df['Attrition'], test_size=0.2, random_state=42
    )

    # Train a Random Forest model
    model = RandomForestClassifier()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    # Save the model
    model_path = f"rf_model_{ds}.joblib"
    joblib.dump(model, model_path)

    ti.xcom_push(key='random_forest_model', value={'model_path': model_path, 'accuracy': accuracy})


def choose_best_model(**kwargs):
    ti = kwargs['ti']
    lgbm_result = ti.xcom_pull(key='lgbm_model', task_ids='ml_train_lgbm')
    rf_result = ti.xcom_pull(key='random_forest_model', task_ids='ml_train_rf')

    model_scores = {
        'lgbm': lgbm_result['accuracy'],
        'random_forest': rf_result['accuracy']
    }

    best_model_key = max(model_scores, key=model_scores.get)
    worst_model_path = rf_result['model_path'] if best_model_key == 'lgbm' else lgbm_result['model_path']
    best_score = model_scores[best_model_key]

    os.remove(worst_model_path)
    print(f"Best Model: {best_model_key} with score {best_score}")
```

Si todo se ejecuta correctamente, habremos construido nuestra pipeline. A diferencia del primer ejemplo, esta pipeline ejecutara con backfilling 5 fechas previas a la actual, las cuales seran procesadas en 5 ejecuciones en paralelo.

# Recomendaciones para definir tareas

La atomizacion en Apache Airflow se refiere a la practica de dividir flujos de trabajo complejos en tareas individuales y manejables, cada una con una responsabilidad especifica. Esto no solo simplifica el diseño y mantenimiento del DAG, sino que tambien mejora la capacidad de monitoreo y recuperacion de errores. Al tratar cada tarea como una unidad independiente, se pueden establecer dependencias claras y precisas, optimizando la ejecucion paralela y garantizando una mayor flexibilidad y escalabilidad en el procesamiento de datos.

Si observamos un flujo no atomizado, las tareas estan agrupadas y contienen trabajos incompletos que pueden resultar en resultados inconsistentes. La idea de la atomizacion es que cada tarea sea lo mas indivisible posible, entregando todo o nada. Esto facilita la identificacion y resolucion de errores en la ejecucion.

Por otro lado, la idempotencia en Apache Airflow se refiere a la capacidad de ejecutar una tarea multiples veces sin cambiar el resultado mas alla de la primera ejecucion. Esto es crucial para garantizar la consistencia y confiabilidad de los flujos de trabajo, especialmente en situaciones donde pueden ocurrir reintentos o fallos. Una tarea idempotente esta diseñada de tal manera que si se ejecuta nuevamente, no afecta el estado del sistema ni los datos procesados, permitiendo una recuperacion eficiente y segura de errores sin introducir duplicidades o inconsistencias en el proceso.

Hablamos de una tarea idempotente cuando, al ejecutarla `N` veces, siempre proporciona el mismo resultado sin variaciones debido al numero de intentos. Esto no significa que una tarea ejecutada el lunes debe producir el mismo resultado que una tarea ejecutada el martes con diferentes datos. Mas bien, significa que si re-ejecutamos la tarea con los mismos datos del lunes o del martes, los resultados seran consistentes y no cambiaran.

# Conclusion

En este documento, hemos explorado una introduccion a las canalizaciones productivas y el uso de Airflow como herramienta. Cabe destacar que esto es solo el comienzo. Para una comprension mas profunda, recomiendo seguir profundizando en las referencias originales y en la documentacion oficial de Airflow.

Un aspecto crucial despues de entender lo basico sobre las canalizaciones es como podemos utilizarlas para automatizar procesos y mejorar sustancialmente el despliegue de nuevos modelos. Por esta razon, vale la pena profundizar en las necesidades especificas al desarrollar un sistema de machine learning y en como estas necesidades pueden organizarse en distintos niveles.

Lo que queda ahora es sumergirnos en nuestra existencia como este erizo:

![Erizo](https://media1.giphy.com/media/3xz2BCohVTd7h2Kvfi/giphy.gif?cid=7941fdc6rtfq24r4djuze5siavdihaqs836ef6jvphibujh6&ep=v1_gifs_search&rid=giphy.gif&ct=g)

# Referencias

- Documento original en Notion: <https://www.notion.so/92c01b81cb97405288394947dcfdfeb6>
- Templates reference: <https://airflow.apache.org/docs/apache-airflow/stable/templates-ref.html>
