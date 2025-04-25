// Tema değiştirme fonksiyonları
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme);

// Hizmet listelerini tanımlama
const services = {
    kadin: [
        'Saç Kesimi ve Şekillendirme',
        'Cilt Bakımı',
        'Manikür & Pedikür',
        'Kaş & Kirpik',
        'Makyaj'
    ],
    erkek: [
        'Saç Kesimi',
        'Sakal Tıraşı',
        'Yüz Bakımı',
        'Masaj',
        'Kaş & Burun Bakımı'
    ]
};

// Form elementlerini seçme
const appointmentForm = document.getElementById('appointmentForm');
const genderSelect = document.getElementById('gender');
const serviceSelect = document.getElementById('service');
const dateInput = document.getElementById('date');
const searchInput = document.getElementById('searchInput');

// Cinsiyet seçimine göre hizmetleri güncelleme
genderSelect.addEventListener('change', function() {
    const selectedGender = this.value;
    serviceSelect.innerHTML = '<option value="">Hizmet Seçiniz</option>';
    
    if (selectedGender) {
        services[selectedGender].forEach(service => {
            const option = document.createElement('option');
            option.value = service;
            option.textContent = service;
            serviceSelect.appendChild(option);
        });
    }
});

// Minimum tarih ayarlama
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().split('T')[0];

// Randevu sınıfı
class Appointment {
    constructor(gender, name, email, service, date, time) {
        this.id = Date.now().toString();
        this.gender = gender;
        this.name = name;
        this.email = email;
        this.service = service;
        this.date = date;
        this.time = time;
    }
}

// Randevu yönetimi
class AppointmentManager {
    constructor() {
        this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    }

    addAppointment(appointment) {
        // Aynı tarih ve saatte randevu kontrolü
        const existingAppointment = this.appointments.find(app => 
            app.date === appointment.date && 
            app.time === appointment.time &&
            app.gender === appointment.gender
        );

        if (existingAppointment) {
            throw new Error('Bu tarih ve saatte randevu dolu!');
        }

        this.appointments.push(appointment);
        this.saveAppointments();
    }

    removeAppointment(id) {
        this.appointments = this.appointments.filter(app => app.id !== id);
        this.saveAppointments();
    }

    saveAppointments() {
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
    }

    filterAppointments(query) {
        query = query.toLowerCase();
        return this.appointments.filter(app =>
            app.name.toLowerCase().includes(query) ||
            app.service.toLowerCase().includes(query) ||
            app.date.includes(query)
        );
    }
}

const appointmentManager = new AppointmentManager();

// Form gönderimi
appointmentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const appointment = new Appointment(
        genderSelect.value,
        document.getElementById('name').value,
        document.getElementById('email').value,
        serviceSelect.value,
        dateInput.value,
        document.getElementById('time').value
    );

    try {
        appointmentManager.addAppointment(appointment);
        showNotification('Randevunuz başarıyla oluşturuldu!', 'success');
        appointmentForm.reset();
        displayAppointments();
        simulateEmailConfirmation(appointment);
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Randevuları görüntüleme
function displayAppointments(appointments = appointmentManager.appointments) {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '';

    appointments.forEach(app => {
        const item = document.createElement('div');
        item.className = 'list-group-item fade-in';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${app.name}</h6>
                    <small>${app.service} (${app.gender === 'kadin' ? 'Kadın' : 'Erkek'})</small>
                    <p class="mb-1">📅 ${formatDate(app.date)} - ⏰ ${app.time}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteAppointment('${app.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        appointmentsList.appendChild(item);
    });
}

// Tarih formatı
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Randevu silme
function deleteAppointment(id) {
    if (confirm('Randevuyu iptal etmek istediğinizden emin misiniz?')) {
        appointmentManager.removeAppointment(id);
        displayAppointments();
        showNotification('Randevu başarıyla iptal edildi.', 'info');
    }
}

// Arama fonksiyonu
searchInput.addEventListener('input', function() {
    const filteredAppointments = appointmentManager.filterAppointments(this.value);
    displayAppointments(filteredAppointments);
});

// Bildirim gösterme
function showNotification(message, type) {
    const modal = new bootstrap.Modal(document.getElementById('notificationModal'));
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;
    modalMessage.className = `alert alert-${type === 'error' ? 'danger' : type}`;
    modal.show();
}

// E-posta doğrulama animasyonu
function simulateEmailConfirmation(appointment) {
    setTimeout(() => {
        showNotification(
            `${appointment.email} adresine randevu onay e-postası gönderildi.`,
            'info'
        );
    }, 1000);
}

// Sayfa yüklendiğinde randevuları göster
displayAppointments();
