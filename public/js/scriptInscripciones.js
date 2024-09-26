document.addEventListener("DOMContentLoaded", function () {
  let modoCalificar = false;

  function limpiarTablaInscripciones() {
    const tabla = document.getElementById("tablaInscripciones");
    tabla.innerHTML = "";
  }

  function asociarEventos() {
    document.querySelectorAll(".seleccionInscripcion").forEach((radio) => {
      radio.addEventListener("change", function () {
        document.getElementById("eliminar").disabled = false;
        document.getElementById("eliminar").classList.remove("bg-gray-400");
        document.getElementById("eliminar").classList.add("bg-red-500");

        document.getElementById("calificar").disabled = false;
        document.getElementById("calificar").classList.remove("bg-gray-400");
        document.getElementById("calificar").classList.add("bg-green-500");

        if (modoCalificar) {
          document.getElementById("calificar").textContent = "Calificar";
          modoCalificar = false;
        }
      });
    });

    document.getElementById("eliminar").addEventListener("click", function () {
      const seleccion = document.querySelector(
        'input[name="seleccion"]:checked'
      );
      if (seleccion) {
        const [estudiante_id, curso_id] = seleccion.value.split("-");
        const confirmar = confirm(
          "¿Estás seguro de que quieres eliminar la inscripción?"
        );
        if (confirmar) {
          fetch(`/inscripciones/${curso_id}/${estudiante_id}`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.mens) {
                alert(data.mens);
                window.location.reload();
              }
            })
            .catch((error) => console.error("Error:", error));
        }
      } else {
        alert("Por favor selecciona una inscripción antes de eliminar.");
      }
    });

    document.getElementById("calificar").addEventListener("click", function () {
      const seleccion = document.querySelector(
        'input[name="seleccion"]:checked'
      );
      if (seleccion) {
        const fila = seleccion.closest("tr");
        const notaInput = fila.querySelector(".notaInput");

        const [estudiante_id, curso_id] = seleccion.value.split("-");

        //  console.log("Estudiante ID:", estudiante_id);
        //    console.log("Curso ID:", curso_id);

        if (!estudiante_id || !curso_id) {
          alert(
            "Error en la selección de la inscripción. Por favor, intenta nuevamente."
          );
          return;
        }

        if (!modoCalificar) {
          notaInput.disabled = false;
          notaInput.focus();
          document.getElementById("calificar").textContent = "Guardar Nota";
          modoCalificar = true;
        } else {
          const nuevaNota = notaInput.value;

          if (nuevaNota < 0 || nuevaNota > 10 || isNaN(nuevaNota)) {
            alert("La nota debe estar entre 0 y 10.");
            return;
          }
          console.log("Nueva nota:", nuevaNota);

          fetch(`/inscripciones/calificar/${curso_id}/${estudiante_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nota: nuevaNota }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.mens) {
                alert(data.mens);
              }

              notaInput.disabled = true;
              document.getElementById("calificar").textContent = "Calificar";
              modoCalificar = false;
            })
            .catch((error) => console.error("Error:", error));
        }
      } else {
        alert("Por favor selecciona una inscripción antes de calificar.");
      }
    });
  }
  document
    .getElementById("buscarAlumno")
    .addEventListener("click", function () {
      const dniEstudiante = document.querySelector(
        'input[name="dni_estudiante"]'
      ).value;

      if (dniEstudiante) {
        fetch(`/inscripciones/xEstudiantePorDNI/${dniEstudiante}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            if (data.inscripciones && data.inscripciones.length > 0) {
              limpiarTablaInscripciones();
              const tbody = document.getElementById("tablaInscripciones");

              data.inscripciones.forEach((inscripcion) => {
                const fechaInscripcion = inscripcion.fecha_inscripcion
                  ? new Date(inscripcion.fecha_inscripcion).toLocaleDateString()
                  : "Fecha no disponible";

                const nota =
                  inscripcion.nota !== null
                    ? inscripcion.nota
                    : "No calificado";

                const row = `
                                <tr class="cursor-pointer hover:bg-gray-200">
                                    <td class="px-6 py-4">${
                                      data.estudiante.nombre
                                    } ${data.estudiante.apellido}</td>
                                    <td class="px-6 py-4">${
                                      inscripcion.curso_nombre
                                    }</td>
                                    <td class="px-6 py-4">${fechaInscripcion}</td>
                                    <td class="px-6 py-4">
                                        <input type="number" name="nota" value="${nota}" disabled min="0" max="10" class="notaInput shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    </td>
                                    <td class="px-6 py-4">
                                        <input type="radio" name="seleccion" value="${
                                          inscripcion.estudiante_id !==
                                          undefined
                                            ? inscripcion.estudiante_id
                                            : ""
                                        }-${
                  inscripcion.curso_id !== undefined ? inscripcion.curso_id : ""
                }" class="seleccionInscripcion">
                                    </td>
                                </tr>
                            `;
                tbody.insertAdjacentHTML("beforeend", row);
              });

              asociarEventos(); // Asociar eventos después de actualizar la tabla
            } else {
              alert("No se encontraron inscripciones para este estudiante.");
            }
             })
            .catch((error) => console.error("Error:", error));
          } else {
          alert("Por favor ingresa el DNI del estudiante.");
         }
    });

  document
    .getElementById("buscarCurso")
    .addEventListener("click", function (event) {
      event.preventDefault(); //evita acciones locas del navegador
      const nombreCurso = document
        .querySelector('input[name="nombre"]')
        .value.trim();

      if (nombreCurso) {
        fetch(`/inscripciones/xCurso/${nombreCurso}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.inscripciones && data.inscripciones.length > 0) {
              limpiarTablaInscripciones();
              const tbody = document.getElementById("tablaInscripciones");
              data.inscripciones.forEach((inscripcion) => {
                const fechaInscripcion = inscripcion.fecha_inscripcion
                  ? new Date(inscripcion.fecha_inscripcion).toDateString()
                  : "Fecha no disponible";

                const nota =
                  inscripcion.nota !== null
                    ? inscripcion.nota
                    : "No calificado";

                const row = `<tr class="cursor-pointer hover:bg-gray-200">
                                    <td class="px-6 py-4">${inscripcion.estudiante_nombre} ${inscripcion.estudiante_apellido}</td>
                                    <td class="px-6 py-4">${data.curso}</td>
                                    <td class="px-6 py-4">${fechaInscripcion}</td>
                                    <td class="px-6 py-4">
                                        <input type="number" name="nota" value="${nota}" disabled min="0" max="10" class="notaInput shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                                    </td>
                                    <td class="px-6 py-4"><input type="radio" name="seleccion" value="${inscripcion.estudiante_id}-${inscripcion.curso_id}" class="seleccionInscripcion"></td>
                                </tr>`;
                tbody.innerHTML += row;
              });
              asociarEventos();
            } else {
              alert("No se encontraron inscripciones para este curso.");
            }
          })
          .catch((error) => console.error("Error:", error));
      } else {
        alert("Por favor ingresa el nombre del curso.");
      }
    });

  asociarEventos();
});
