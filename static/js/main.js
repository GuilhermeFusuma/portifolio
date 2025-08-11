// Main JavaScript for Creative Portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {  // Skip empty href
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // Like button functionality
    document.querySelectorAll('.like-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const contentType = this.dataset.contentType;
            const contentId = this.dataset.contentId;
            const likeCount = this.querySelector('.like-count');
            const icon = this.querySelector('i');
            
            // Disable button during request
            this.disabled = true;
            
            fetch(`/like/${contentType}/${contentId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update like count
                likeCount.textContent = data.likes_count;
                
                // Update button appearance
                if (data.liked) {
                    this.classList.remove('btn-outline-danger');
                    this.classList.add('btn-danger');
                    icon.classList.add('animate__animated', 'animate__heartBeat');
                } else {
                    this.classList.remove('btn-danger');
                    this.classList.add('btn-outline-danger');
                }
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    icon.classList.remove('animate__animated', 'animate__heartBeat');
                }, 1000);
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error updating like. Please try again.', 'danger');
            })
            .finally(() => {
                // Re-enable button
                this.disabled = false;
            });
        });
    });

    // Form validation enhancements
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Search functionality
    const searchForm = document.querySelector('#searchForm');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[name="q"]');
        const categorySelect = searchForm.querySelector('select[name="category"]');
        
        // Auto-submit on category change
        if (categorySelect) {
            categorySelect.addEventListener('change', function() {
                searchForm.submit();
            });
        }
        
        // Clear search functionality
        const clearBtn = document.querySelector('#clearSearch');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                searchInput.value = '';
                categorySelect.value = '';
                searchForm.submit();
            });
        }
    }

    // Image lazy loading
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));

    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.dataset.copy;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showAlert('Copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showAlert('Failed to copy to clipboard', 'danger');
            });
        });
    });

    // File upload preview
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Find or create preview element
                    let preview = input.parentNode.querySelector('.file-preview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'file-preview mt-2';
                        input.parentNode.appendChild(preview);
                    }
                    
                    if (file.type.startsWith('image/')) {
                        preview.innerHTML = `<img src="${e.target.result}" class="img-thumbnail" style="max-height: 100px;">`;
                    } else {
                        preview.innerHTML = `<small class="text-muted">Selected: ${file.name}</small>`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Auto-hide alerts
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
        alerts.forEach(alert => {
            const alertInstance = new bootstrap.Alert(alert);
            alertInstance.close();
        });
    }, 5000);

    // Initialize carousel if present
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true
        });
    });

    // Progress bars animation
    const progressBars = document.querySelectorAll('.progress-bar');
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.dataset.width || progressBar.style.width;
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 100);
                progressObserver.unobserve(progressBar);
            }
        });
    });
    
    progressBars.forEach(bar => progressObserver.observe(bar));

    // Typing effect for hero text
    const typingElements = document.querySelectorAll('.typing-effect');
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect when element is visible
        const typingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    typingObserver.unobserve(entry.target);
                }
            });
        });
        
        typingObserver.observe(element);
    });
});

// Utility functions
function showAlert(message, type = 'info') {
    const alertsContainer = document.querySelector('.alerts-container') || createAlertsContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            const alertInstance = new bootstrap.Alert(alert);
            alertInstance.close();
        }
    }, 5000);
}

function createAlertsContainer() {
    const container = document.createElement('div');
    container.className = 'alerts-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading state management
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
    element.disabled = true;
    element.dataset.originalContent = originalContent;
}

function hideLoading(element) {
    element.innerHTML = element.dataset.originalContent;
    element.disabled = false;
    delete element.dataset.originalContent;
}

// Theme toggle (for future dark mode support)
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

// Call theme initialization
initTheme();

// Export functions for global use
window.showAlert = showAlert;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.toggleTheme = toggleTheme;
