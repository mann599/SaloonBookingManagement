var auth = {
    initLogin: function() {
        $("#login-form").on("submit", function(e) {
            e.preventDefault();
            $("#login-error").text("");
            var email = $("#email").val().trim();
            var password = $("#password").val();
            if (!email || !password) {
                $("#login-error").text("Email and password are required.");
                return;
            }
            $.ajax({
                url: API_BASE + "/auth/login",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ email: email, password: password }),
                success: function(data) {
                    setToken(data.token);
                    setUserRole(data.role != null ? String(data.role) : "");
                    var returnUrl = new URLSearchParams(window.location.search).get("return");
                    if (data.role === "Provider" || data.role === 1) {
                        window.location.href = "provider-dashboard.html";
                    } else {
                        window.location.href = returnUrl ? returnUrl : "index.html";
                    }
                },
                error: function(xhr) {
                    $("#login-error").text(xhr.status === 401 ? "Invalid email or password." : "Login failed.");
                }
            });
        });
    },

    initRegister: function() {
        $("#register-form").on("submit", function(e) {
            e.preventDefault();
            $("#register-error").text("");
            var name = $("#name").val().trim();
            var email = $("#email").val().trim();
            var password = $("#password").val();
            if (!name || name.length < 2) {
                $("#register-error").text("Name must be at least 2 characters.");
                return;
            }
            if (!email) {
                $("#register-error").text("Email is required.");
                return;
            }
            if (!password || password.length < 6) {
                $("#register-error").text("Password must be at least 6 characters.");
                return;
            }
            $.ajax({
                url: API_BASE + "/auth/register",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ name: name, email: email, password: password }),
                success: function(data) {
                    setToken(data.token);
                    setUserRole(data.role != null ? String(data.role) : "");
                    if (data.role === "Provider" || data.role === 1) {
                        window.location.href = "provider-dashboard.html";
                    } else {
                        window.location.href = "index.html";
                    }
                },
                error: function(xhr) {
                    $("#register-error").text(xhr.status === 400 ? "Email already exists." : "Registration failed.");
                }
            });
        });
    }
};
