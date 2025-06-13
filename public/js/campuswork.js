document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
    const salaryRange = document.getElementById('salaryRange');
    const currentSalary = document.getElementById('currentSalary');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const jobListings = document.querySelectorAll('#jobListings > div:not(#noMatchesMessage)');
    const noMatchesMessage = document.getElementById('noMatchesMessage');
    
    // Objeto para almacenar los filtros seleccionados
    let activeFilters = {
        tipo: [],
        area: [],
        horario: [],
        modalidad: [],
        salario: 15
    };
    
    // Actualizar el valor del salario mostrado
    if (salaryRange) {
        salaryRange.addEventListener('input', function() {
            if (currentSalary) {
                currentSalary.textContent = this.value + '$';
                activeFilters.salario = parseInt(this.value);
            }
        });
    }
    
    // Manejar cambios en los checkboxes de filtro
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const filterType = this.getAttribute('data-filter');
            const filterValue = this.value;
            
            if (this.checked) {
                // Añadir el valor al filtro si está marcado
                if (!activeFilters[filterType].includes(filterValue)) {
                    activeFilters[filterType].push(filterValue);
                }
            } else {
                // Eliminar el valor del filtro si está desmarcado
                const index = activeFilters[filterType].indexOf(filterValue);
                if (index > -1) {
                    activeFilters[filterType].splice(index, 1);
                }
            }
        });
    });
    
    // Aplicar filtros al hacer clic en el botón
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Limpiar filtros
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Función para aplicar los filtros
    function applyFilters() {
        // Obtener todas las oportunidades
        const opportunities = document.querySelectorAll('#jobListings > div:not(#noMatchesMessage)');
        let visibleCount = 0;
        
        opportunities.forEach(opportunity => {
            let shouldShow = true;
            
            // Verificar filtros de tipo de empleo (horario)
            if (activeFilters.tipo.length > 0) {
                const jobType = opportunity.querySelector('.inline-block.px-2.py-1.bg-red-50.text-primary')?.textContent.trim();
                if (!jobType || !activeFilters.tipo.includes(jobType)) {
                    shouldShow = false;
                }
            }
            
            // Verificar filtros de área de estudio
            if (shouldShow && activeFilters.area.length > 0) {
                const studyAreaElement = opportunity.querySelector('i.ri-book-open-line');
                if (studyAreaElement) {
                    const studyArea = studyAreaElement.parentNode.textContent.trim();
                    const matchFound = activeFilters.area.some(area => studyArea.includes(area));
                    if (!matchFound) {
                        shouldShow = false;
                    }
                } else {
                    shouldShow = false;
                }
            }
            
            // Verificar filtros de modalidad
            if (shouldShow && activeFilters.modalidad.length > 0) {
                const modalityElement = opportunity.querySelector('i.ri-computer-line');
                if (modalityElement) {
                    const modality = modalityElement.parentNode.textContent.trim();
                    const matchFound = activeFilters.modalidad.some(mod => modality.includes(mod));
                    if (!matchFound) {
                        shouldShow = false;
                    }
                } else {
                    shouldShow = false;
                }
            }
            
            // Verificar filtros de horario (si es diferente del tipo)
            if (shouldShow && activeFilters.horario.length > 0) {
                const jobType = opportunity.querySelector('.inline-block.px-2.py-1.bg-red-50.text-primary')?.textContent.trim();
                if (!jobType || !activeFilters.horario.includes(jobType)) {
                    shouldShow = false;
                }
            }
            
            // Mostrar u ocultar la oportunidad según los filtros
            opportunity.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        // Mostrar mensaje si no hay resultados
        if (noMatchesMessage) {
            if (visibleCount === 0) {
                noMatchesMessage.classList.remove('hidden');
            } else {
                noMatchesMessage.classList.add('hidden');
            }
        }
    }
    
    // Función para limpiar todos los filtros
    function clearFilters() {
        // Desmarcar todos los checkboxes
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Resetear el rango de salario
        if (salaryRange) {
            salaryRange.value = 15;
            if (currentSalary) {
                currentSalary.textContent = '15$';
            }
        }
        
        // Limpiar el objeto de filtros activos
        activeFilters = {
            tipo: [],
            area: [],
            horario: [],
            modalidad: [],
            salario: 15
        };
        
        // Mostrar todas las oportunidades
        const opportunities = document.querySelectorAll('#jobListings > div');
        opportunities.forEach(opportunity => {
            opportunity.style.display = 'block';
        });
        
        // Ocultar mensaje de no resultados
        if (noMatchesMessage) {
            noMatchesMessage.classList.add('hidden');
        }
    }
    
    // Inicializar la página mostrando todas las oportunidades
    clearFilters();
});
