let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let calendar;
let fechaSeleccionada;
let deferredPrompt;

// --- Pedir permiso para notificaciones ---
if ("Notification" in window) {
    Notification.requestPermission();
}

// Inicializar calendario
document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        selectable: true,
        dateClick: function (info) {
            fechaSeleccionada = info.dateStr;
            document.getElementById('fecha').value = fechaSeleccionada;
            abrirModal();
        },
        events: tareas.map(t => ({
            title: t.materia,
            start: t.fecha,
            description: t.descripcion,
            backgroundColor: getColorByPriority(t.prioridad),
            borderColor: "#333333",
            textColor: "#ffffff"
        }))
    });

    calendar.render();
    verificarFechas();
});

// --- Modal ---
function abrirModal() {
    document.getElementById('modal').style.display = "block";
}
function cerrarModal() {
    document.getElementById('modal').style.display = "none";
    document.getElementById('materia').value = "";
    document.getElementById('descripcion').value = "";
}

// --- Guardar tarea ---
function guardarTarea() {
    const materia = document.getElementById('materia').value;
    const descripcion = document.getElementById('descripcion').value;
    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    const prioridad = document.getElementById('prioridad').value;

    if (materia && descripcion && fecha) {
        const nuevaTarea = { materia, descripcion, fecha, categoria, prioridad };
        tareas.push(nuevaTarea);
        localStorage.setItem("tareas", JSON.stringify(tareas));

        calendar.addEvent({
            title: materia,
            start: fecha,
            backgroundColor: getColorByPriority(prioridad),
            borderColor: "#333333",
            textColor: "#ffffff"
        });

        cerrarModal();
        verificarFechas();
    } else {
        alert("Completa todos los campos");
    }
}

// --- Event listeners de botones ---
document.getElementById('guardar').addEventListener('click', guardarTarea);
document.getElementById('cerrar').addEventListener('click', cerrarModal);

// --- Función color según prioridad ---
function getColorByPriority(prioridad) {
    switch (prioridad) {
        case "Alta": return "#e74c3c";
        case "Media": return "#f1c40f";
        case "Baja": return "#2ecc71";
        default: return "#3498db";
    }
}

// --- Notificaciones ---
function verificarFechas() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const hoy = new Date();

    tareas.forEach(tarea => {
        const fechaTarea = new Date(tarea.fecha);
        const diffDias = Math.ceil((fechaTarea - hoy) / (1000 * 60 * 60 * 24));

        if (diffDias === 0) {
            new Notification("📅 Hoy tienes una tarea", {
                body: `${tarea.materia} - ${tarea.descripcion}`,
                icon: "https://cdn-icons-png.flaticon.com/512/2830/2830089.png"
            });
        } else if (diffDias === 1) {
            new Notification("⏳ Mañana vence una tarea", {
                body: `${tarea.materia} - ${tarea.descripcion}`,
                icon: "https://cdn-icons-png.flaticon.com/512/2830/2830089.png"
            });
        }
    });
}

// --- Registrar Service Worker ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registrado', reg))
        .catch(err => console.log('Error SW:', err));
    });
}

// --- Botón instalación PWA ---
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btnInstall = document.createElement('button');
    btnInstall.textContent = "Instalar EstudiApp";
    btnInstall.style.cssText = "position:fixed;bottom:20px;right:20px;padding:10px 20px;background:#2575fc;color:white;border:none;border-radius:8px;cursor:pointer;z-index:1000;";
    document.body.appendChild(btnInstall);

    btnInstall.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') console.log('Usuario aceptó instalar la app');
            else console.log('Usuario rechazó instalar la app');
            deferredPrompt = null;
            btnInstall.remove();
        });
    });
});
