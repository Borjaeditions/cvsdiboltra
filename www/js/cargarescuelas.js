const escuelaSelect = document.querySelector('select[name="escuela"]');
const carreraSelect = document.getElementById('carrera-select');

escuelaSelect.addEventListener('change', () => {
  const escuela = escuelaSelect.value;
  carreraSelect.innerHTML = '<option value="">Seleccione una carrera</option>'; // Limpiar

  if (escuela && carrerasPorEscuela[escuela]) {
    carrerasPorEscuela[escuela].forEach(carrera => {
      const option = document.createElement('option');
      option.value = carrera;
      option.textContent = carrera;
      carreraSelect.appendChild(option);
    });
  }
});