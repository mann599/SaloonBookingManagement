var servicesPage = {
    init: function() {
        updateNavForAuth();
        this.loadCategories();
        this.loadServices(null);
        $(document).on("click", "#categories .card-item", function() {
            var id = $(this).data("category-id");
            $("#categories .card-item").removeClass("selected");
            $(this).addClass("selected");
            servicesPage.loadServices(id);
        });
    },

    loadCategories: function() {
        $.get(API_BASE + "/categories")
            .done(function(categories) {
                var html = "";
                categories.forEach(function(cat) {
                    html += '<div class="card-item" data-category-id="' + cat.id + '"><h3>' + escapeHtml(cat.name) + '</h3><p>Category</p></div>';
                });
                $("#categories").html(html || "<p>No categories.</p>");
            })
            .fail(function() {
                $("#categories").html("<p>Failed to load categories.</p>");
            });
    },

    loadServices: function(categoryId) {
        var url = categoryId ? API_BASE + "/services/category/" + categoryId : API_BASE + "/services";
        $.get(url)
            .done(function(services) {
                var html = "";
                services.forEach(function(s) {
                    html += '<div class="card-item"><h3>' + escapeHtml(s.name) + '</h3><p>$' + s.price + ' &ndash; ' + s.duration + ' min</p></div>';
                });
                $("#services-list").html(html || "<p>No services.</p>");
            })
            .fail(function() {
                $("#services-list").html("<p>Failed to load services.</p>");
            });
    }
};

function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
