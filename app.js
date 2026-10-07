/**
 * Gestor de Gastos Personales - Lógica de Negocio
 * Maneja el registro, almacenamiento local y renderizado de gastos.
 */

// ==========================================
// 1. Selección de elementos del DOM
// ==========================================
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmountElement = document.getElementById('total-amount');

// ==========================================
// 2. Estado de la aplicación
// ==========================================
// Intentamos obtener los gastos del LocalStorage, si no existen, iniciamos con un array vacío
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// ==========================================
// 3. Funciones de utilidad
// ==========================================

/**
 * Guarda el estado actual de los gastos en el LocalStorage del navegador.
 */
const saveToLocalStorage = () => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
};

/**
 * Genera un identificador único para cada gasto.
 * @returns {string} ID único basado en la fecha actual.
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Formatea un número a formato de moneda (ej: 1500.5 -> "$1,500.50").
 * @param {number} amount - El monto a formatear.
 * @returns {string} El monto formateado.
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

// ==========================================
// 4. Funciones de renderizado
// ==========================================

/**
 * Actualiza el monto total gastado en la interfaz.
 */
const updateTotalAmount = () => {
    const total = expenses.reduce((sum, expense) => sum + expense.monto, 0);
    totalAmountElement.textContent = formatCurrency(total);
};

/**
 * Renderiza la lista completa de gastos en el DOM.
 */
const renderExpenses = () => {
    // Limpiamos la lista actual
    expenseList.innerHTML = '';

    // Si no hay gastos, mostramos un mensaje
    if (expenses.length === 0) {
        expenseList.innerHTML = '<li class="empty-message">No hay gastos registrados aún.</li>';
        updateTotalAmount();
        return;
    }

    // Generamos el HTML para cada gasto
    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.className = 'expense-item';
        listItem.innerHTML = `
            <div class="expense-info">
                <strong>${expense.descripcion}</strong>
                <span class="expense-category">${expense.categoria}</span>
                <span class="expense-date">${expense.fecha}</span>
            </div>
            <div class="expense-actions">
                <span class="expense-amount">${formatCurrency(expense.monto)}</span>
                <button class="btn btn-delete" data-id="${expense.id}" aria-label="Eliminar gasto">Eliminar</button>
            </div>
        `;
        expenseList.appendChild(listItem);
    });

    updateTotalAmount();
};

// ==========================================
// 5. Manejo de eventos
// ==========================================

/**
 * Maneja el envío del formulario para agregar un nuevo gasto.
 * @param {Event} e - El evento de submit del formulario.
 */
const handleAddExpense = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Obtenemos los valores del formulario
    const descripcion = document.getElementById('descripcion').value.trim();
    const monto = parseFloat(document.getElementById('monto').value);
    const categoria = document.getElementById('categoria').value;
    const fecha = document.getElementById('fecha').value;

    // Validación básica (aunque el HTML ya tiene 'required', es buena práctica)
    if (!descripcion || isNaN(monto) || monto <= 0 || !categoria || !fecha) {
        alert('Por favor, complete todos los campos correctamente.');
        return;
    }

    // Creamos el objeto del nuevo gasto
    const newExpense = {
        id: generateId(),
        descripcion,
        monto,
        categoria,
        fecha
    };

    // Lo agregamos al array, guardamos y renderizamos
    expenses.push(newExpense);
    saveToLocalStorage();
    renderExpenses();

    // Reseteamos el formulario
    expenseForm.reset();
    
    // Establecemos la fecha de hoy por defecto para el próximo registro
    document.getElementById('fecha').valueAsDate = new Date();
};

/**
 * Maneja los clics dentro de la lista de gastos (Delegación de eventos).
 * Se usa para detectar el clic en el botón de eliminar.
 * @param {Event} e - El evento de click.
 */
const handleDeleteExpense = (e) => {
    // Verificamos si el elemento clickeado es un botón de eliminar
    if (e.target.classList.contains('btn-delete')) {
        const expenseId = e.target.getAttribute('data-id');
        
        // Confirmación antes de eliminar
        if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
            // Filtramos el array para quitar el gasto con ese ID
            expenses = expenses.filter(expense => expense.id !== expenseId);
            
            saveToLocalStorage();
            renderExpenses();
        }
    }
};

// ==========================================
// 6. Inicialización
// ==========================================

// Asignamos los event listeners
expenseForm.addEventListener('submit', handleAddExpense);
expenseList.addEventListener('click', handleDeleteExpense);

// Establecemos la fecha de hoy como valor por defecto al cargar la página
document.getElementById('fecha').valueAsDate = new Date();

// Renderizamos la lista inicial (vacía o con datos guardados)
renderExpenses();