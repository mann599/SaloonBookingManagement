const API_BASE = "/api";

function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function setUserRole(role) {
    localStorage.setItem("userRole", role);
}

function getUserRole() {
    return localStorage.getItem("userRole");
}

function clearToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
}

function isLoggedIn() {
    return !!getToken();
}

function isProvider() {
    var r = getUserRole();
    return r === "Provider" || r === "1";
}

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        var token = getToken();
        if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
    }
});

function redirectToLogin() {
    window.location.href = "login.html?return=" + encodeURIComponent(window.location.pathname + window.location.search);
}

function updateNavForAuth() {
    if (isLoggedIn()) {
        $("#nav-login").hide();
        $("#nav-register").hide();
        $("#nav-logout").show();
        if (isProvider()) {
            $("#nav-dashboard").show();
            $("#nav-book").hide();
            $("#nav-mybookings").hide();
        } else {
            $("#nav-dashboard").hide();
            $("#nav-book").show();
            $("#nav-mybookings").show();
        }
    } else {
        $("#nav-login").show();
        $("#nav-register").show();
        $("#nav-logout").hide();
        $("#nav-dashboard").hide();
        $("#nav-book").show();
        $("#nav-mybookings").show();
    }
}

$(function() {
    $("#nav-logout").on("click", function(e) {
        e.preventDefault();
        clearToken();
        window.location.href = "index.html";
    });
});
