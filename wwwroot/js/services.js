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
            servicesPage.syncFilterRadio(id);
        });
        
        $(document).on("change", "#filter-categories .radio-input", function() {
            var id = $(this).val();
            
            $("#categories .card-item").removeClass("selected");
            $("#categories .card-item[data-category-id='" + id + "']").addClass("selected");
            servicesPage.loadServices(id);
        });
        
        $(document).on("click", ".reset-btn", function() {
            servicesPage.resetFilters();
        });
        
        $(document).on("input", ".search-input", function() {
            servicesPage.searchServices($(this).val());
        });
    },

    loadCategories: function() {
        $.get(API_BASE + "/categories")
            .done(function(categories) {
                var html = "";
                var filterHtml = "";
                
                categories.forEach(function(cat) {
                    html += '<div class="card-item" data-category-id="' + cat.id + '"><h3>' + escapeHtml(cat.name) + '</h3><p>Category</p></div>';
                    filterHtml += '<label class="radio-label"><input type="radio" name="category-filter" class="radio-input" value="' + cat.id + '" data-category-name="' + escapeHtml(cat.name) + '"><span class="radio-checkmark"></span>' + escapeHtml(cat.name) + '</label>';
                });
                
                $("#categories").html(html || "<p>No categories.</p>");
                $("#filter-categories").html(filterHtml || "<p>No categories.</p>");
            })
            .fail(function() {
                $("#categories").html("<p>Failed to load categories.</p>");
                $("#filter-categories").html("<p>Failed to load categories.</p>");
            });
    },

    syncFilterRadio: function(categoryId) {
        $("#filter-categories .radio-input").prop("checked", false);
        if (categoryId) {
            $("#filter-categories .radio-input[value='" + categoryId + "']").prop("checked", true);
        }
    },

    resetFilters: function() {
        $("#categories .card-item").removeClass("selected");
        $("#filter-categories .radio-input").prop("checked", false);
        $(".search-input").val("");
        this.loadServices(null);
    },

    searchServices: function(keyword) {
        if (!keyword) {
            var selectedCategory = $("#categories .card-item.selected").data("category-id");
            this.loadServices(selectedCategory);
            return;
        }
        
        var url = API_BASE + "/services/search?q=" + encodeURIComponent(keyword);
        $.get(url)
            .done(function(services) {
                var html = "";
                var userRole = localStorage.getItem('userRole') || 'customer';
                
                services.forEach(function(s) {
                    var imgHtml = s.image ? '<img src="' + escapeHtml(s.image) + '" alt="' + escapeHtml(s.name) + '" onerror="this.style.display=\'none\'">' : '';
                    var bookButtonHtml = (userRole !== 'provider') ? '<button class="book-btn" onclick="servicesPage.bookService(\'' + escapeHtml(s.id) + '\')">Book Now</button>' : '';
                    
                    html += '<div class="service-card"><div class="service-image">' + imgHtml + '</div><div class="service-content"><div class="service-header"><span class="service-tag">Service</span><button class="service-favorite"><i class="far fa-heart"></i></button></div><h3 class="service-name">' + escapeHtml(s.name) + '</h3><div class="service-location"><i class="fas fa-map-marker-alt"></i>' + escapeHtml(s.location || 'Salon') + '</div><div class="service-footer"><div class="service-rating"><div class="rating-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div><span class="rating-value">4.5</span></div><div class="service-price"><span class="price-current">$' + s.price + '</span></div></div>' + bookButtonHtml + '</div></div>';
                });
                $("#services-list").html(html || "<p>No services found.</p>");
                $("#service-count").text(services.length);
            })
            .fail(function() {
                $("#services-list").html("<p>Failed to search services.</p>");
                $("#service-count").text("0");
            });
    },

    loadServices: function(categoryId) {
        var url = categoryId ? API_BASE + "/services/category/" + categoryId : API_BASE + "/services";
        $.get(url)
            .done(function(services) {
                var html = "";
                var userRole = localStorage.getItem('userRole') || 'customer';
                
                services.forEach(function(s) {
                    var imgHtml = s.image ? '<img src="' + escapeHtml(s.image) + '" alt="' + escapeHtml(s.name) + '" onerror="this.style.display=\'none\'">' : '';
                    var bookButtonHtml = (userRole !== 'provider') ? '<button class="book-btn" onclick="servicesPage.bookService(\'' + escapeHtml(s.id) + '\')">Book Now</button>' : '';
                    
                    html += '<div class="service-card"><div class="service-image">' + imgHtml + '</div><div class="service-content"><div class="service-header"><span class="service-tag">Service</span><button class="service-favorite"><i class="far fa-heart"></i></button></div><h3 class="service-name">' + escapeHtml(s.name) + '</h3><div class="service-location"><i class="fas fa-map-marker-alt"></i>' + escapeHtml(s.location || 'Salon') + '</div><div class="service-footer"><div class="service-rating"><div class="rating-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div><span class="rating-value">4.5</span></div><div class="service-price"><span class="price-current">$' + s.price + '</span><span class="price-original">$' + (parseFloat(s.price) * 1.2).toFixed(2) + '</span></div></div>' + bookButtonHtml + '</div></div>';
                });
                $("#services-list").html(html || "<p>No services.</p>");
                $("#service-count").text(services.length);
            })
            .fail(function() {
                $("#services-list").html("<p>Failed to load services.</p>");
                $("#service-count").text("0");
            });
    },

    bookService: function(serviceId) {
        // Store the selected service ID and redirect to booking page
        localStorage.setItem('selectedServiceId', serviceId);
        window.location.href = 'booking.html';
    },
};

function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
