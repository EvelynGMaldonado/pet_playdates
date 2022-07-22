const joinAppBtn = document.getElementsByClassName("join-app");

const joinToApp = async(e) => {
    e.preventDeault();
    location.replace('login');
}


joinAppBtn.addEventListener("click", joinToApp);