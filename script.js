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
            backgroundColor: "#ff7f50",
            borderColor: "#ff4500",
            textColor: "#ffffff"
        }))
    });

    calendar.render();
    verificarFechas();
});

// Guardar tarea
document.getElementById('guardar').addEventListener('click', () => {
    const materia = document.getElementById('materia').value;
    const descripcion = document.getElementById('descripcion').value;
    const fecha = document.getElementById('fecha').value;

    if (materia && descripcion && fecha) {
        const nuevaTarea = { materia, descripcion, fecha };
        tareas.push(nuevaTarea);
        localStorage.setItem("tareas", JSON.stringify(tareas));

        calendar.addEvent({
            title: materia,
            start: fecha,
            backgroundColor: "#ff7f50",
            borderColor: "#ff4500",
            textColor: "#ffffff"
        });

        cerrarModal();
        verificarFechas();
    } else {
        alert("Completa todos los campos");
    }
});

// Modal
function abrirModal() {
    document.getElementById('modal').style.display = "block";
}
function cerrarModal() {
    document.getElementById('modal').style.display = "none";
    document.getElementById('materia').value = "";
    document.getElementById('descripcion').value = "";
}
document.getElementById('cerrar').addEventListener('click', cerrarModal);

// Notificaciones
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
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuario aceptó instalar la app');
            } else {
                console.log('Usuario rechazó instalar la app');
            }
            deferredPrompt = null;
            btnInstall.remove();
        });
    });
});
