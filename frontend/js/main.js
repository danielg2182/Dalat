/* ==========================================================
   STUDYOS - ARCHIVO JAVASCRIPT COMPLETO Y ACTUALIZADO
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. CONTROLADOR DE VISTAS (SPA ROUTER)
    const navLinks = document.querySelectorAll('.main-menu .nav-link');
    const views = document.querySelectorAll('.app-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = link.getAttribute('data-view') + '-view';

            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active-view');
                if (view.id === targetViewId) {
                    view.classList.add('active-view');
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    // 2. GUARDAR Y CARGAR TAREAS Y MATERIAS DESDE LOCALSTORAGE
    const urgentContainer = document.getElementById('urgentColumn');
    const progressContainer = document.getElementById('progressColumn');
    const laterContainer = document.getElementById('laterColumn');
    const subjectMenu = document.getElementById('subjectMenu');

    function guardarEnMemoria() {
        const datosTablero = {
            urgent: urgentContainer.innerHTML,
            progress: progressContainer.innerHTML,
            later: laterContainer.innerHTML,
            menuHTML: subjectMenu ? subjectMenu.innerHTML : ''
        };
        localStorage.setItem('studyos_tareas', JSON.stringify(datosTablero));
    }

    function cargarDeMemoria() {
        const guardado = localStorage.getItem('studyos_tareas');
        if (guardado) {
            const datosTablero = JSON.parse(guardado);
            if (urgentContainer) urgentContainer.innerHTML = datosTablero.urgent;
            if (progressContainer) progressContainer.innerHTML = datosTablero.progress;
            if (laterContainer) laterContainer.innerHTML = datosTablero.later;
            if (subjectMenu && datosTablero.menuHTML) {
                subjectMenu.innerHTML = datosTablero.menuHTML;
            }
        }
    }


    // 3. GESTIÓN DE ESTADOS VACÍOS
    function verificarEstadosVacios() {
        [urgentContainer, progressContainer, laterContainer].forEach(container => {
            if (!container) return;

            const mensajePrevio = container.querySelector('.empty-state-msg');
            if (mensajePrevio) mensajePrevio.remove();

            const tarjetasVisibles = Array.from(container.querySelectorAll('.task-card-item'))
                .filter(card => card.style.display !== 'none');

            const totalTarjetas = container.querySelectorAll('.task-card-item');

            if (totalTarjetas.length === 0 || tarjetasVisibles.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-state-msg';
                emptyMsg.textContent = totalTarjetas.length === 0 ? '¡Todo al día por aquí! 🎉' : 'No hay tareas de esta materia aquí.';
                emptyMsg.style.cssText = 'text-align: center; color: #a0aec0; font-size: 0.85rem; padding: 20px 0; font-style: italic;';
                container.appendChild(emptyMsg);
            }
        });
    }


    // 4. CONFIGURAR TARJETAS (CHECKBOX, ELIMINAR Y ARRASTRE)
    let tarjetaArrastrada = null;

    function configurarTarjeta(cardItem) {
        cardItem.setAttribute('draggable', 'true');
        cardItem.style.cursor = 'grab';

        cardItem.addEventListener('dragstart', () => {
            tarjetaArrastrada = cardItem;
            cardItem.style.opacity = '0.4';
        });

        cardItem.addEventListener('dragend', () => {
            cardItem.style.opacity = '1';
            tarjetaArrastrada = null;
            guardarEnMemoria();
            actualizarContadores();
            verificarEstadosVacios();
        });

        const checkbox = cardItem.querySelector('.checkbox-circle');
        const taskName = cardItem.querySelector('.task-name') || cardItem.querySelector('p');

        if (!checkbox || !taskName) return;

        checkbox.addEventListener('click', () => {
            checkbox.classList.toggle('checked');
            if (checkbox.classList.contains('checked')) {
                checkbox.style.backgroundColor = '#5c43c4';
                checkbox.style.borderColor = '#5c43c4';
                taskName.style.textDecoration = 'line-through';
                taskName.style.color = '#a0aec0';
            } else {
                checkbox.style.backgroundColor = 'transparent';
                checkbox.style.borderColor = '#cbd5e0';
                taskName.style.textDecoration = 'none';
                taskName.style.color = '#2d3748';
            }
            guardarEnMemoria();
        });

        let topBar = cardItem.querySelector('.task-card-top') || cardItem.firstElementChild;
        if (topBar) {
            topBar.style.display = 'flex';
            topBar.style.justifyContent = 'space-between';
            topBar.style.alignItems = 'center';

            let deleteBtn = cardItem.querySelector('.delete-task-btn');
            if (!deleteBtn) {
                deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-task-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Eliminar tarea';
                deleteBtn.style.cssText = 'background: none; border: none; color: #cbd5e0; cursor: pointer; font-size: 1.2rem; font-weight: bold; padding: 0 4px; margin-left: auto; transition: color 0.2s;';
                
                deleteBtn.onmouseover = () => deleteBtn.style.color = '#e53e3e';
                deleteBtn.onmouseout = () => deleteBtn.style.color = '#cbd5e0';

                topBar.appendChild(deleteBtn);
            }

            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                cardItem.remove();
                guardarEnMemoria();
                actualizarContadores();
                verificarEstadosVacios();
            };
        }
    }


    // 5. ZONAS DE SOLTADO (DRAG & DROP)
    [urgentContainer, progressContainer, laterContainer].forEach(container => {
        if (!container) return;

        const columnCard = container.closest('.column-card');

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        container.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (columnCard) {
                columnCard.style.border = '2px dashed #5c43c4';
                columnCard.style.backgroundColor = '#f7fafc';
            }
        });

        container.addEventListener('dragleave', (e) => {
            if (columnCard && !columnCard.contains(e.relatedTarget)) {
                columnCard.style.border = '';
                columnCard.style.backgroundColor = '';
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (columnCard) {
                columnCard.style.border = '';
                columnCard.style.backgroundColor = '';
            }
            if (tarjetaArrastrada) {
                const msg = container.querySelector('.empty-state-msg');
                if (msg) msg.remove();

                container.appendChild(tarjetaArrastrada);
                guardarEnMemoria();
                actualizarContadores();
                verificarEstadosVacios();
            }
        });
    });

    function reengancharTarjetas() {
        document.querySelectorAll('.task-card-item').forEach(card => {
            configurarTarjeta(card);
        });
    }


    // 6. ACTUALIZAR CONTADORES DE LAS COLUMNAS
    function actualizarContadores() {
        const columnas = [
            { id: 'urgentColumn', contadorSel: '.col-urgent .column-counter' },
            { id: 'progressColumn', contadorSel: '.col-progress .column-counter' },
            { id: 'laterColumn', contadorSel: '.col-later .column-counter' }
        ];

        let totalPendientes = 0;

        columnas.forEach(col => {
            const container = document.getElementById(col.id);
            const contadorBadge = document.querySelector(col.contadorSel);
            
            if (container && contadorBadge) {
                const cantidad = container.querySelectorAll('.task-card-item').length;
                contadorBadge.textContent = cantidad;
                totalPendientes += cantidad;
            }
        });

        const badgeGeneral = document.querySelector('.task-count-badge');
        if (badgeGeneral) {
            badgeGeneral.textContent = `${totalPendientes} pendientes`;
        }
    }


    // 7. SISTEMA DE FILTRADO POR MATERIA
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#4a5568';
            });
            btn.style.background = '#5c43c4';
            btn.style.color = 'white';

            const materiaSeleccionada = btn.getAttribute('data-filter');

            document.querySelectorAll('.task-card-item').forEach(card => {
                const subjectSpan = card.querySelector('.task-subject');
                const materiaCard = subjectSpan ? subjectSpan.textContent.trim() : '';

                if (materiaSeleccionada === 'all' || materiaCard.toLowerCase() === materiaSeleccionada.toLowerCase()) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            verificarEstadosVacios();
        });
    });


    // INICIALIZAR AL ABRIR LA PÁGINA
    cargarDeMemoria();
    reengancharTarjetas();
    actualizarContadores();
    verificarEstadosVacios();


    // 8. CREACIÓN DE TAREAS Y GESTIÓN DE NUEVA MATERIA
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const subjectDetails = document.getElementById('subjectDetails');
    const subjectText = document.getElementById('subjectText');
    const newSubjectInput = document.getElementById('newSubjectInput');
    const saveSubjectBtn = document.getElementById('saveSubjectBtn');
    const priorityText = document.getElementById('priorityText');
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityDetails = document.getElementById('priorityDetails');

    let currentPriority = 'Urgente';
    let materiaActual = 'General';

    priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            currentPriority = option.textContent.trim();
            if (priorityText) priorityText.textContent = currentPriority;
            if (priorityDetails) priorityDetails.removeAttribute('open');
        });
    });

    // Manejar clics en el menú personalizado de materias
    if (subjectMenu) {
        subjectMenu.addEventListener('click', (e) => {
            const option = e.target.closest('.subject-option');
            if (!option) return;

            const valor = option.getAttribute('data-value');

            if (valor === 'nueva_materia_opcion') {
                subjectDetails.removeAttribute('open');
                subjectDetails.style.display = 'none';
                if (newSubjectInput) {
                    newSubjectInput.style.display = 'inline-block';
                    newSubjectInput.value = '';
                    newSubjectInput.focus();
                }
                if (saveSubjectBtn) saveSubjectBtn.style.display = 'inline-block';
            } else {
                materiaActual = valor;
                if (subjectText) subjectText.textContent = materiaActual;
                subjectDetails.removeAttribute('open');
            }
        });
    }

    // Guardar nueva materia desde el input integrado
    if (saveSubjectBtn) {
        saveSubjectBtn.addEventListener('click', () => {
            const nuevaMat = newSubjectInput ? newSubjectInput.value.trim() : '';
            if (nuevaMat !== '') {
                materiaActual = nuevaMat;
                if (subjectText) subjectText.textContent = materiaActual;

                const nuevaOp = document.createElement('div');
                nuevaOp.className = 'subject-option';
                nuevaOp.setAttribute('data-value', nuevaMat);
                nuevaOp.textContent = nuevaMat;

                const opcionAgregar = subjectMenu.querySelector('.subject-add-option');
                subjectMenu.insertBefore(nuevaOp, opcionAgregar);
                
                guardarEnMemoria();
            }

            if (newSubjectInput) newSubjectInput.style.display = 'none';
            saveSubjectBtn.style.display = 'none';
            subjectDetails.style.display = 'inline-block';
        });
    }

    function addNewTask() {
        if (!taskInput) return;
        const text = taskInput.value.trim();
        if (!text) return;

        let targetId = 'urgentColumn';
        if (currentPriority.includes('Progreso')) {
            targetId = 'progressColumn';
        } else if (currentPriority.includes('después')) {
            targetId = 'laterColumn';
        }

        const container = document.getElementById(targetId);
        if (!container) return;

        const msg = container.querySelector('.empty-state-msg');
        if (msg) msg.remove();

        const card = document.createElement('div');
            card.className = `subject-grade-card materia-card-dinamica ${temaColorClass}`;
            card.innerHTML = `
                <button class="delete-subject-btn delete-mat-btn" data-id="${mat.id}" type="button" title="Eliminar materia">×</button>
                <div class="materia-click-target" style="cursor: pointer;">
                    <div class="card-subject-top">
                        <div>
                            <h4>${mat.nombre}</h4>
                            <span class="subject-subinfo">3 cortes · ${totalEvs} evaluaciones</span>
                        </div>
                        <span class="subject-grade-num">${notaFinal.toFixed(1)}</span>
                    </div>
                    <div class="cortes-grid">
                        <div class="corte-box">
                            <span class="corte-label">1er</span>
                            <span class="corte-score">${calcularPromedioCorte(mat.cortes[1]).toFixed(1)}</span>
                        </div>
                        <div class="corte-box">
                            <span class="corte-label">2do</span>
                            <span class="corte-score">${calcularPromedioCorte(mat.cortes[2]).toFixed(1)}</span>
                        </div>
                        <div class="corte-box">
                            <span class="corte-label">3er</span>
                            <span class="corte-score muted">${mat.cortes[3]?.length ? calcularPromedioCorte(mat.cortes[3]).toFixed(1) : '—'}</span>
                        </div>
                    </div>
                    <div class="subject-progress-track">
                        <div class="subject-progress-fill" style="width: ${Math.min((totalEvs / 5) * 100, 100)}%;"></div>
                    </div>
                </div>
                <span class="view-detail-link materia-click-target" style="cursor: pointer;">Ver detalle →</span>
            `;

        configurarTarjeta(card);

        container.appendChild(card);
        taskInput.value = '';
        
        materiaActual = 'General';
        if (subjectText) subjectText.textContent = 'General';

        guardarEnMemoria();
        actualizarContadores();
        verificarEstadosVacios();
    }

    if (addTaskBtn) addTaskBtn.addEventListener('click', addNewTask);
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewTask();
        });
    }

    let stateHorario = JSON.parse(localStorage.getItem('studyos_horario')) || [
        { id: '1', dia: 'Lunes', hora: '07:30', duracion: '90 min', materiaId: '', nombrePersonalizado: 'Cálculo III', aula: 'Aula 204' },
        { id: '2', dia: 'Miércoles', hora: '10:00', duracion: '90 min', materiaId: '', nombrePersonalizado: 'Arquitectura de Software', aula: 'Sala Virtual' }
    ];

    function guardarHorarioMemoria() {
        localStorage.setItem('studyos_horario', JSON.stringify(stateHorario));
    }

    const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long' };
    const fechaActualStr = new Date().toLocaleDateString('es-ES', opcionesFecha);
    const subtitleEl = document.getElementById('horarioDateSubtitle');
    if (subtitleEl) {
        subtitleEl.textContent = fechaActualStr.charAt(0).toUpperCase() + fechaActualStr.slice(1);
    }

    const viewDayBtn = document.getElementById('viewDayBtn');
    const viewWeekBtn = document.getElementById('viewWeekBtn');
    const dayViewContainer = document.getElementById('dayViewContainer');
    const weekViewContainer = document.getElementById('weekViewContainer');
    let vistaActualHorario = 'day';

    if (viewDayBtn && viewWeekBtn) {
        viewDayBtn.addEventListener('click', () => {
            vistaActualHorario = 'day';
            viewDayBtn.classList.add('active-toggle');
            viewWeekBtn.classList.remove('active-toggle');
            dayViewContainer.style.display = 'block';
            weekViewContainer.style.display = 'none';
            renderizarHorario();
        });

        viewWeekBtn.addEventListener('click', () => {
            vistaActualHorario = 'week';
            viewWeekBtn.classList.add('active-toggle');
            viewDayBtn.classList.remove('active-toggle');
            dayViewContainer.style.display = 'none';
            weekViewContainer.style.display = 'grid';
            renderizarHorario();
        });
    }

    function obtenerNombreMateriaPorId(idMat, nombreDefault) {
        if (!idMat) return nombreDefault;
        const encontrada = stateMaterias.find(m => m.id === idMat);
        return encontrada ? encontrada.nombre : nombreDefault;
    }

   function renderizarHorario() {
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const numeroDiaJs = new Date().getDay();
        const mapDias = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Lunes' };
        const diaHoyStr = mapDias[numeroDiaJs] || 'Lunes';

        if (vistaActualHorario === 'day') {
            if (!dayViewContainer) return;
            dayViewContainer.innerHTML = '';
            const clasesHoy = stateHorario.filter(item => item.dia.toLowerCase() === diaHoyStr.toLowerCase());
            
            if (clasesHoy.length === 0) {
                dayViewContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No hay clases programadas para hoy (${diaHoyStr}).</p>`;
                return;
            }

            clasesHoy.sort((a, b) => a.hora.localeCompare(b.hora));
            clasesHoy.forEach(clase => {
                const nombreMostrar = obtenerNombreMateriaPorId(clase.materiaId, clase.nombrePersonalizado);
                const itemDiv = document.createElement('div');
                itemDiv.className = 'timeline-item';
                itemDiv.innerHTML = `
                    <div class="timeline-time">${clase.hora}</div>
                    <div class="timeline-dot"></div>
                    <div class="timeline-card" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4>${nombreMostrar}</h4>
                            <span>${clase.aula || 'Aula general'} · ${clase.duracion}</span>
                        </div>
                        <button class="delete-schedule-btn delete-cls-btn" data-id="${clase.id}" title="Eliminar clase">×</button>
                    </div>
                `;
                dayViewContainer.appendChild(itemDiv);
            });
        } else {
            if (!weekViewContainer) return;
            weekViewContainer.innerHTML = '';
            diasSemana.forEach(dia => {
                const colDiv = document.createElement('div');
                colDiv.className = 'week-day-column';
                const clasesDelDia = stateHorario.filter(item => item.dia.toLowerCase() === dia.toLowerCase());
                clasesDelDia.sort((a, b) => a.hora.localeCompare(b.hora));

                let contenidoClases = '';
                clasesDelDia.forEach(clase => {
                    const nombreMostrar = obtenerNombreMateriaPorId(clase.materiaId, clase.nombrePersonalizado);
                    contenidoClases += `
                        <div class="schedule-card-item">
                            <div>
                                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">${nombreMostrar}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${clase.hora} · ${clase.duracion}</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">${clase.aula || ''}</div>
                            </div>
                            <button class="delete-schedule-btn delete-cls-btn" data-id="${clase.id}" title="Eliminar clase">×</button>
                        </div>
                    `;
                });

                if (clasesDelDia.length === 0) {
                    contenidoClases = `<p style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin: 15px 0; font-style: italic;">Sin clases</p>`;
                }

                colDiv.innerHTML = `
                    <div class="week-day-title">${dia}</div>
                    ${contenidoClases}
                `;
                weekViewContainer.appendChild(colDiv);
            });
        }
    }

    // Evento global para eliminar clases del horario con el botón "×"
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-cls-btn')) {
            const idClase = e.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta clase del horario?')) {
                stateHorario = stateHorario.filter(c => c.id !== idClase);
                guardarHorarioMemoria();
                renderizarHorario();
            }
        }
    });

    // ================= CONTROLADOR DEL MODAL DE HORARIO =================
    const modalOverlay = document.getElementById('scheduleModalOverlay');
    const addScheduleClassBtn = document.getElementById('addScheduleClassBtn');
    const modalCancelClassBtn = document.getElementById('modalCancelClassBtn');
    const modalSaveClassBtn = document.getElementById('modalSaveClassBtn');
    const modalSubjectSelect = document.getElementById('modalSubjectSelect');

    function actualizarSelectMateriasModal() {
        if (!modalSubjectSelect) return;
        modalSubjectSelect.innerHTML = '<option value="">-- Seleccionar materia de notas (Opcional) --</option>';
        if (Array.isArray(stateMaterias)) {
            stateMaterias.forEach(mat => {
                const opt = document.createElement('option');
                opt.value = mat.id;
                opt.textContent = mat.nombre;
                modalSubjectSelect.appendChild(opt);
            });
        }
    }

    if (addScheduleClassBtn && modalOverlay) {
        addScheduleClassBtn.addEventListener('click', () => {
            actualizarSelectMateriasModal();
            document.getElementById('modalCustomNameInput').value = '';
            modalOverlay.style.display = 'flex';
        });
    }

    if (modalCancelClassBtn && modalOverlay) {
        modalCancelClassBtn.addEventListener('click', () => {
            modalOverlay.style.display = 'none';
        });
    }

    if (modalSaveClassBtn && modalOverlay) {
        modalSaveClassBtn.addEventListener('click', () => {
            const dia = document.getElementById('modalDayInput').value;
            const hora = document.getElementById('modalTimeInput').value || '08:00';
            const duracion = document.getElementById('modalDurationInput').value || '90 min';
            const aula = document.getElementById('modalRoomInput').value || 'Campus';
            const materiaId = modalSubjectSelect.value;
            const nombreCustom = document.getElementById('modalCustomNameInput').value.trim();

            let nombreFinal = 'Clase general';
            if (materiaId) {
                const encontrada = stateMaterias.find(m => m.id === materiaId);
                if (encontrada) nombreFinal = encontrada.nombre;
            } else if (nombreCustom) {
                nombreFinal = nombreCustom;
            }

            const nuevaClase = {
                id: 'clase_' + Date.now(),
                dia: dia,
                hora: hora,
                duracion: duracion,
                materiaId: materiaId,
                nombrePersonalizado: nombreFinal,
                aula: aula
            };

            stateHorario.push(nuevaClase);
            guardarHorarioMemoria();
            renderizarHorario();

            modalOverlay.style.display = 'none';
        });
    }

    renderizarHorario();
    renderizarDashboardNotas();
});

// ================= CALCULADORA RÁPIDA INTERACTIVA =================
    const calcCard = document.getElementById('quickCalculatorCard');
    if (calcCard) {
        const rowsContainer = document.getElementById('calcRowsContainer');
        const addRowBtn = document.getElementById('addRowBtn');
        const instantAvgTop = document.getElementById('instantAvgTop');
        const instantAvgBottom = document.getElementById('instantAvgBottom');
        const totalWeightSpan = document.getElementById('totalWeightSpan');

        function calcularPromedioRapido() {
            const rows = rowsContainer.querySelectorAll('.calc-row-item');
            let sumaPonderada = 0;
            let sumaPesos = 0;

            rows.forEach(row => {
                const scoreInput = row.querySelector('.calc-score');
                const weightInput = row.querySelector('.calc-weight');

                const score = parseFloat(scoreInput.value) || 0;
                const weight = parseFloat(weightInput.value) || 0;

                sumaPonderada += score * (weight / 100);
                sumaPesos += weight;
            });

            let promedioFinal = 0;
            if (sumaPesos > 0) {
                promedioFinal = sumaPonderada / (sumaPesos / 100);
            }

            const resultadoFormateado = promedioFinal.toFixed(2);
            if (instantAvgTop) instantAvgTop.textContent = resultadoFormateado;
            if (instantAvgBottom) instantAvgBottom.textContent = resultadoFormateado;
            if (totalWeightSpan) totalWeightSpan.textContent = sumaPesos;
        }

        // Escuchar cambios en inputs en tiempo real
        rowsContainer.addEventListener('input', calcularPromedioRapido);

        // Eliminar fila
        rowsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('calc-delete-btn')) {
                const rowItem = e.target.closest('.calc-row-item');
                if (rowsContainer.querySelectorAll('.calc-row-item').length > 1) {
                    rowItem.remove();
                    calcularPromedioRapido();
                }
            }
        });

        // Añadir nueva fila
        addRowBtn.addEventListener('click', () => {
            const nuevaFila = document.createElement('div');
            nuevaFila.className = 'calc-row-item';
            nuevaFila.innerHTML = `
                <input type="text" value="Nueva evaluación" class="calc-input text-left calc-name">
                <input type="number" value="0" min="0" max="10" step="0.1" class="calc-input text-center calc-score">
                <input type="number" value="0" min="0" max="100" class="calc-input text-center calc-weight">
                <button class="calc-delete-btn" type="button">×</button>
            `;
            rowsContainer.appendChild(nuevaFila);
            calcularPromedioRapido();
        });

        // Calcular al iniciar la página
        calcularPromedioRapido();
    }
    // ================= SISTEMA DE CALIFICACIONES Y MATERIAS =================
   

    let stateMaterias = [];
    try {
        const rawData = localStorage.getItem('studyos_materias');
        stateMaterias = rawData ? JSON.parse(rawData) : [];
        if (!Array.isArray(stateMaterias)) stateMaterias = [];
    } catch (error) {
        console.warn("Se reinició el almacenamiento local por datos corruptos.");
        stateMaterias = [];
        localStorage.removeItem('studyos_materias');
    }

    let materiaActivaId = null;
    let corteActivoNum = 1;

    function guardarMateriasMemoria() {
        localStorage.setItem('studyos_materias', JSON.stringify(stateMaterias));
    }

    function calcularPromedioCorte(evaluaciones) {
        if (!evaluaciones || evaluaciones.length === 0) return 0;
        let sumaPonderada = 0;
        let sumaPesos = 0;
        evaluaciones.forEach(ev => {
            sumaPonderada += ev.calificacion * (ev.peso / 100);
            sumaPesos += ev.peso;
        });
        return sumaPesos > 0 ? (sumaPonderada / (sumaPesos / 100)) : 0;
    }

    function calcularNotaFinalMateria(materia) {
        // Suponiendo 3 cortes con peso equitativo (33.3% c/u o ponderado)
        let c1 = calcularPromedioCorte(materia.cortes[1]);
        let c2 = calcularPromedioCorte(materia.cortes[2]);
        let c3 = calcularPromedioCorte(materia.cortes[3]);
        // Promedio simple o ponderado de cortes
        return (c1 + c2 + c3) / 3;
    }

function renderizarDashboardNotas() {
        const gridContainer = document.getElementById('subjectsGridContainer');
        if (!gridContainer) return;

        const tarjetasMaterias = gridContainer.querySelectorAll('.materia-card-dinamica');
        tarjetasMaterias.forEach(card => card.remove());

        let sumaGlobal = 0;
        let mejorMat = { nombre: '—', nota: -1 };
        let peorMat = { nombre: '—', nota: 11 };

        // Arreglo de temas de color armónicos para rotar entre materias
        const temasColores = ['card-theme-purple', 'card-theme-green', 'card-theme-pink', 'card-theme-yellow'];

        stateMaterias.forEach((mat, index) => {
            const notaFinal = calcularNotaFinalMateria(mat);
            sumaGlobal += notaFinal;

            if (notaFinal > mejorMat.nota) { mejorMat = { nombre: mat.nombre, nota: notaFinal }; }
            if (notaFinal < peorMat.nota) { peorMat = { nombre: mat.nombre, nota: notaFinal }; }

            let totalEvs = (mat.cortes[1]?.length || 0) + (mat.cortes[2]?.length || 0) + (mat.cortes[3]?.length || 0);
            const temaColorClass = temasColores[index % temasColores.length];

            // Calculamos el porcentaje de la barra de forma limpia y segura aquí
            const porcentajeBarra = Math.min(Math.max((notaFinal / 10) * 100, 0), 100);

            const card = document.createElement('div');
            card.className = `subject-grade-card materia-card-dinamica ${temaColorClass}`;
            card.innerHTML = `
                <button class="delete-subject-btn delete-mat-btn" data-id="${mat.id}" type="button" title="Eliminar materia">×</button>
                <div class="materia-click-target" style="cursor: pointer;">
                    <div class="card-subject-top">
                        <div>
                            <h4>${mat.nombre}</h4>
                            <span class="subject-subinfo">3 cortes · ${totalEvs} evaluaciones</span>
                        </div>
                        <span class="subject-grade-num">${notaFinal.toFixed(1)}</span>
                    </div>
                    <div class="cortes-grid">
                        <div class="corte-box">
                            <span class="corte-label">1er</span>
                            <span class="corte-score">${calcularPromedioCorte(mat.cortes[1]).toFixed(1)}</span>
                        </div>
                        <div class="corte-box">
                            <span class="corte-label">2do</span>
                            <span class="corte-score">${calcularPromedioCorte(mat.cortes[2]).toFixed(1)}</span>
                        </div>
                        <div class="corte-box">
                            <span class="corte-label">3er</span>
                            <span class="corte-score muted">${mat.cortes[3]?.length ? calcularPromedioCorte(mat.cortes[3]).toFixed(1) : '—'}</span>
                        </div>
                    </div>
                    <div class="subject-progress-track">
                        <div class="subject-progress-fill" style="width: ${porcentajeBarra}%;"></div>
                    </div>
                </div>
                <span class="view-detail-link materia-click-target" style="cursor: pointer;">Ver detalle →</span>
            `;

            // Evento para abrir detalle
            card.querySelectorAll('.materia-click-target').forEach(el => {
                el.addEventListener('click', () => {
                    materiaActivaId = mat.id;
                    abrirDetalleMateria();
                });
            });

            const calcCardElement = document.getElementById('quickCalculatorCard');
            if (calcCardElement) {
                gridContainer.insertBefore(card, calcCardElement);
            } else {
                gridContainer.appendChild(card);
            }
        });

        // Actualizar Métricas Superiores
        const promedioGlobal = stateMaterias.length > 0 ? (sumaGlobal / stateMaterias.length) : 0;
        document.getElementById('globalAvgVal').textContent = promedioGlobal.toFixed(2);
        document.getElementById('bestSubjectVal').textContent = mejorMat.nombre;
        document.getElementById('bestSubjectDesc').textContent = `${mejorMat.nota.toFixed(2)} promedio`;
        document.getElementById('worstSubjectVal').textContent = peorMat.nombre;
        document.getElementById('worstSubjectDesc').textContent = `${peorMat.nota.toFixed(2)} promedio`;
    }

    // Evento global para eliminar materia al hacer clic en la "×"
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-mat-btn')) {
            const idMateria = e.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
                stateMaterias = stateMaterias.filter(m => m.id !== idMateria);
                guardarMateriasMemoria();
                renderizarDashboardNotas();
            }
        }
    });

    function abrirDetalleMateria() {
        const mat = stateMaterias.find(m => m.id === materiaActivaId);
        if (!mat) return;

        // Ocultar notas y mostrar detalle usando las vistas SPA existentes
        document.getElementById('notes-view').classList.remove('active-view');
        document.getElementById('subject-detail-view').classList.add('active-view');

        document.getElementById('detailSubjectTitle').textContent = mat.nombre;
        let totalEvs = (mat.cortes[1]?.length || 0) + (mat.cortes[2]?.length || 0) + (mat.cortes[3]?.length || 0);
        document.getElementById('detailSubjectSub').textContent = `3 cortes · ${totalEvs} evaluaciones registradas`;
        document.getElementById('detailFinalGrade').textContent = calcularNotaFinalMateria(mat).toFixed(2);

        renderizarCorteActivo();
    }

    function renderizarCorteActivo() {
        const mat = stateMaterias.find(m => m.id === materiaActivaId);
        if (!mat) return;

        document.getElementById('currentCutTitle').textContent = `${corteActivoNum}er Corte`;
        const evsCorte = mat.cortes[corteActivoNum] || [];
        const promedioCorte = calcularPromedioCorte(evsCorte);
        document.getElementById('currentCutAvg').textContent = promedioCorte.toFixed(2);
        document.getElementById('currentCutWeightSub').textContent = `Peso en nota final: 33% · ${evsCorte.length} evaluaciones`;

        const rowsContainer = document.getElementById('evaluationsRowsContainer');
        rowsContainer.innerHTML = '';

        evsCorte.forEach((ev, idx) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 24px; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;';
            row.innerHTML = `
                <div><strong>${ev.nombre}</strong></div>
                <div><span style="background: var(--tipo-tarea); color: var(--text-tipo-tarea); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem;">${ev.tipo}</span></div>
                <div><strong style="color: var(--text-purple);">${ev.calificacion}/10</strong></div>
                <div>${ev.peso}%</div>
                <button class="calc-delete-btn delete-eval-btn" data-index="${idx}">×</button>
            `;
            rowsContainer.appendChild(row);
        });

        // Ocultar formulario al cambiar de pestaña
        document.getElementById('addNoteFormCard').style.display = 'none';
    }

    // Navegación entre cortes
    document.querySelectorAll('.cut-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cut-tab-btn').forEach(b => b.classList.remove('active-cut'));
            e.target.classList.add('active-cut');
            corteActivoNum = parseInt(e.target.getAttribute('data-cut'));
            renderizarCorteActivo();
        });
    });

    // Volver a la lista de materias
    const backBtn = document.getElementById('backToNotesBtn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('subject-detail-view').classList.remove('active-view');
            document.getElementById('notes-view').classList.add('active-view');
            renderizarDashboardNotas();
        });
    }

    // Botón "+ Agregar nota a este corte"
    const openFormBtn = document.getElementById('openAddNoteFormBtn');
    if (openFormBtn) {
        openFormBtn.addEventListener('click', () => {
            document.getElementById('formTitleHeader').textContent = `Nueva nota — ${corteActivoNum}er Corte`;
            document.getElementById('addNoteFormCard').style.display = 'block';
        });
    }

    // Botón Cancelar formulario
    const cancelFormBtn = document.getElementById('cancelNewNoteBtn');
    if (cancelFormBtn) {
        cancelFormBtn.addEventListener('click', () => {
            document.getElementById('addNoteFormCard').style.display = 'none';
        });
    }

    // Guardar nueva nota
    const saveNoteBtn = document.getElementById('saveNewNoteBtn');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            const mat = stateMaterias.find(m => m.id === materiaActivaId);
            if (!mat) return;

            const nombre = document.getElementById('noteNameInput').value.trim() || 'Evaluación';
            const tipo = document.getElementById('noteTypeInput').value;
            const calificacion = parseFloat(document.getElementById('noteScoreInput').value) || 0;
            const peso = parseFloat(document.getElementById('noteWeightInput').value) || 100;

            if (!mat.cortes[corteActivoNum]) {
                mat.cortes[corteActivoNum] = [];
            }

            mat.cortes[corteActivoNum].push({ nombre, tipo, calificacion, peso });
            guardarMateriasMemoria();
            renderizarCorteActivo();

            document.getElementById('addNoteFormCard').style.display = 'none';
            document.getElementById('noteNameInput').value = '';
        });
    }

    // Eliminar evaluación
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-eval-btn')) {
            const idx = parseInt(e.target.getAttribute('data-index'));
            const mat = stateMaterias.find(m => m.id === materiaActivaId);
            if (mat && mat.cortes[corteActivoNum]) {
                mat.cortes[corteActivoNum].splice(idx, 1);
                guardarMateriasMemoria();
                renderizarCorteActivo();
            }
        }
    });

    
   // ================= MODAL Y CONTROLADOR DE AÑADIR MATERIA =================
    const subjectModalOverlay = document.getElementById('subjectModalOverlay');
    const addSubjectMainBtn = document.getElementById('addSubjectMainBtn');
    const modalCancelSubjectBtn = document.getElementById('modalCancelSubjectBtn');
    const modalSaveSubjectBtn = document.getElementById('modalSaveSubjectBtn');
    const modalSubjectNameInput = document.getElementById('modalSubjectNameInput');

    if (addSubjectMainBtn && subjectModalOverlay) {
        addSubjectMainBtn.addEventListener('click', () => {
            if (modalSubjectNameInput) {
                modalSubjectNameInput.value = '';
            }
            subjectModalOverlay.style.display = 'flex';
            if (modalSubjectNameInput) {
                modalSubjectNameInput.focus();
            }
        });
    }

    if (modalCancelSubjectBtn && subjectModalOverlay) {
        modalCancelSubjectBtn.addEventListener('click', () => {
            subjectModalOverlay.style.display = 'none';
        });
    }

    if (modalSaveSubjectBtn && subjectModalOverlay) {
        modalSaveSubjectBtn.addEventListener('click', () => {
            const nombreMat = modalSubjectNameInput ? modalSubjectNameInput.value.trim() : '';
            if (nombreMat !== '') {
                const nuevaMateria = {
                    id: 'mat_' + Date.now(),
                    nombre: nombreMat,
                    cortes: { 1: [], 2: [], 3: [] }
                };

                if (!Array.isArray(stateMaterias)) {
                    stateMaterias = [];
                }

                stateMaterias.push(nuevaMateria);
                guardarMateriasMemoria();
                renderizarDashboardNotas();
                
                subjectModalOverlay.style.display = 'none';
            } else {
                alert('Por favor ingresa un nombre para la materia.');
            }
        });
    }