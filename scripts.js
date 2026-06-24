/* ==========================================================================
   Mohammed Zaid SP - Immersive Interactive Portfolio Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. Globals & Helpers
    // ---------------------------------------------------------
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Smooth scroll navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if active
                const navMenu = document.querySelector('.nav-menu');
                const mobileBtn = document.querySelector('.mobile-menu-btn');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileBtn.classList.remove('active');
                    mobileBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    mobileBtn.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('active');
        mobileBtn.classList.toggle('active');
        mobileBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    // Navbar Scroll Observer
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Active links updates on scroll
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSectionId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    // ---------------------------------------------------------
    // 2. Canvas Interactive Background Engine Controller
    // ---------------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let activeEngine = 'drifter'; // 'drifter', 'warp', 'nebula'
    let particlesArray = [];
    const maxParticles = 60;
    
    let starsArray = [];
    const maxStars = 100;
    
    let blobsArray = [];
    
    // Scroll velocity tracking
    let scrollSpeed = 0;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        scrollSpeed = Math.min(30, Math.abs(currentScrollY - lastScrollY) * 0.45);
        lastScrollY = currentScrollY;
    });
    
    const mouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Re-initialize active engine states on screen dimension shifts
        if (activeEngine === 'warp') initWarp();
        if (activeEngine === 'nebula') initNebula();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // --- ENGINE A: COSMIC DRIFTER ---
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.vx = (Math.random() * 0.4) - 0.2;
            this.vy = (Math.random() * 0.4) - 0.2;
            this.alpha = Math.random() * 0.5 + 0.15;
            this.color = Math.random() > 0.5 ? 'rgba(99,102,241,' : 'rgba(6,182,212,';
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = dx / distance;
                    const directionY = dy / distance;
                    
                    this.x += directionX * force * 1.5;
                    this.y += directionY * force * 1.5;
                }
            }
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();

    // Click burst for Drifter
    window.addEventListener('click', (e) => {
        if (activeEngine !== 'drifter') return;
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea')) return;
        
        const burstCount = 15;
        for (let i = 0; i < burstCount; i++) {
            const p = new Particle();
            p.x = e.clientX;
            p.y = e.clientY;
            p.vx = (Math.random() * 4) - 2;
            p.vy = (Math.random() * 4) - 2;
            p.size = Math.random() * 3 + 1;
            p.alpha = 0.8;
            particlesArray.push(p);
            
            if (particlesArray.length > 120) {
                particlesArray.shift();
            }
        }
    });

    // --- ENGINE B: SPACE WARP SPEED ---
    class Star {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = (Math.random() - 0.5) * canvas.width * 2;
            this.y = (Math.random() - 0.5) * canvas.height * 2;
            this.z = Math.random() * canvas.width;
            this.px = 0;
            this.py = 0;
            this.color = Math.random() > 0.5 ? '#6366f1' : '#06b6d4';
        }
        update(speed) {
            this.z -= speed;
            if (this.z <= 0) {
                this.reset();
                this.z = canvas.width;
            }
        }
        draw() {
            let cx = canvas.width / 2;
            let cy = canvas.height / 2;
            
            // Steer center dynamically with mouse coordinates
            if (mouse.x !== null && mouse.y !== null) {
                cx = cx + (mouse.x - cx) * 0.25;
                cy = cy + (mouse.y - cy) * 0.25;
            }

            const k = 128 / this.z;
            const px = this.x * k + cx;
            const py = this.y * k + cy;

            if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
                const size = (1 - this.z / canvas.width) * 3 + 0.5;
                
                if (this.px !== 0) {
                    ctx.beginPath();
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = size * 0.6;
                    ctx.moveTo(px, py);
                    ctx.lineTo(this.px, this.py);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
                this.px = px;
                this.py = py;
            } else {
                this.px = 0;
                this.py = 0;
            }
        }
    }

    function initWarp() {
        starsArray = [];
        for (let i = 0; i < maxStars; i++) {
            starsArray.push(new Star());
        }
    }

    // --- ENGINE C: NEBULA FLOW ---
    class NebulaBlob {
        constructor(color, radius) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() * 0.6) - 0.3;
            this.vy = (Math.random() * 0.6) - 0.3;
            this.radius = radius;
            this.color = color; 
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x - this.radius < -100 || this.x + this.radius > canvas.width + 100) this.vx *= -1;
            if (this.y - this.radius < -100 || this.y + this.radius > canvas.height + 100) this.vy *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 450) {
                    this.x += dx * 0.003;
                    this.y += dy * 0.003;
                }
            }
        }
        draw() {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(${this.color}, 0.16)`);
            grad.addColorStop(0.5, `rgba(${this.color}, 0.05)`);
            grad.addColorStop(1, `rgba(${this.color}, 0.0)`);
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    function initNebula() {
        blobsArray = [];
        blobsArray.push(new NebulaBlob('99, 102, 241', Math.min(canvas.width, canvas.height) * 0.45)); // Indigo
        blobsArray.push(new NebulaBlob('6, 182, 212', Math.min(canvas.width, canvas.height) * 0.35));  // Cyan
        blobsArray.push(new NebulaBlob('139, 92, 246', Math.min(canvas.width, canvas.height) * 0.5));   // Purple
    }

    // Toggle click binding
    const bgSelBtns = document.querySelectorAll('.bg-sel-btn');
    bgSelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            bgSelBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeEngine = this.getAttribute('data-engine');
            
            if (activeEngine === 'warp') initWarp();
            if (activeEngine === 'nebula') initNebula();
            if (activeEngine === 'drifter') initParticles();
        });
    });

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (activeEngine === 'drifter') {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
                
                for (let j = i; j < particlesArray.length; j++) {
                    let dx = particlesArray[i].x - particlesArray[j].x;
                    let dy = particlesArray[i].y - particlesArray[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 110) {
                        let opacity = (110 - distance) / 110 * 0.15;
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
        } else if (activeEngine === 'warp') {
            scrollSpeed *= 0.94; // decelerate gradually
            let currentSpeed = 1.0 + scrollSpeed;

            for (let i = 0; i < starsArray.length; i++) {
                starsArray[i].update(currentSpeed);
                starsArray[i].draw();
            }
        } else if (activeEngine === 'nebula') {
            for (let i = 0; i < blobsArray.length; i++) {
                blobsArray[i].update();
                blobsArray[i].draw();
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    // ---------------------------------------------------------
    // 3. Multi-Device Simulator state routing
    // ---------------------------------------------------------
    const simTabs = document.querySelectorAll('.sim-tab');
    const deviceFrames = document.querySelectorAll('.device-frame');

    function switchSimulator(target) {
        simTabs.forEach(t => {
            if (t.getAttribute('data-target') === target) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        deviceFrames.forEach(f => {
            f.classList.remove('active');
        });

        const activeFrame = document.getElementById(`sim-${target}`);
        if (activeFrame) {
            activeFrame.classList.add('active');
        }
    }

    simTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            switchSimulator(target);
        });
    });

    // Services card launcher
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const simTarget = this.getAttribute('data-sim');
            if (simTarget) {
                // Scroll to simulator section
                const playgroundSec = document.getElementById('playground');
                playgroundSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Boot that device simulation
                setTimeout(() => {
                    switchSimulator(simTarget);
                    // Special behavior: focus or trigger device demo state
                    if (simTarget === 'desktop') {
                        document.querySelector('.terminal-input').focus();
                    }
                }, 800);
            }
        });
    });


    // ---------------------------------------------------------
    // 4. Android E-Commerce App Simulation Logic
    // ---------------------------------------------------------
    const phoneScreen = document.querySelector('.phone-screen');
    const btnAppBuys = document.querySelectorAll('.btn-app-buy');
    const cartBadge = document.querySelector('.cart-badge');
    const openCartBtn = document.querySelector('.open-cart');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartDrawer = document.querySelector('.app-cart-drawer');
    const cartDrawerItems = document.querySelector('.cart-drawer-items');
    const cartTotalPriceLabel = document.querySelector('.cart-total-price');
    const checkoutBtn = document.querySelector('.btn-app-checkout');
    
    const paymentScreen = document.querySelector('.app-payment-screen');
    const successScreen = document.querySelector('.app-success-screen');
    const resetAppBtn = document.querySelector('.btn-app-reset');
    
    let shoppingCart = [];

    function updateCartUI() {
        const count = shoppingCart.reduce((acc, item) => acc + item.qty, 0);
        cartBadge.textContent = count;
        
        if (shoppingCart.length === 0) {
            cartDrawerItems.innerHTML = '<p class="empty-cart-msg">Your shopping bag is empty.</p>';
            cartTotalPriceLabel.textContent = '₹0';
            checkoutBtn.style.display = 'none';
        } else {
            cartDrawerItems.innerHTML = '';
            let total = 0;
            shoppingCart.forEach((item, idx) => {
                total += item.price * item.qty;
                const row = document.createElement('div');
                row.className = 'cart-item-row';
                row.innerHTML = `
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <span>₹${item.price.toLocaleString('en-IN')} × ${item.qty}</span>
                    </div>
                    <button class="btn-remove-item" data-index="${idx}"><i class="fas fa-trash"></i></button>
                `;
                cartDrawerItems.appendChild(row);
            });
            cartTotalPriceLabel.textContent = `₹${total.toLocaleString('en-IN')}`;
            checkoutBtn.style.display = 'block';
            
            // Hook remove buttons
            document.querySelectorAll('.btn-remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    shoppingCart.splice(index, 1);
                    updateCartUI();
                });
            });
        }
    }

    btnAppBuys.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const parent = this.closest('.app-product-card');
            const name = parent.getAttribute('data-name');
            const price = parseInt(parent.getAttribute('data-price'));
            
            // Check if exists
            const existing = shoppingCart.find(item => item.name === name);
            if (existing) {
                existing.qty += 1;
            } else {
                shoppingCart.push({ name, price, qty: 1 });
            }
            
            // Quick fly animation effect
            this.textContent = 'Added ✔';
            this.style.background = '#059669';
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.background = 'var(--emerald)';
            }, 1000);
            
            updateCartUI();
        });
    });

    openCartBtn.addEventListener('click', () => cartDrawer.classList.add('active'));
    closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));

    checkoutBtn.addEventListener('click', () => {
        cartDrawer.classList.remove('active');
        paymentScreen.classList.add('active');
        
        setTimeout(() => {
            paymentScreen.classList.remove('active');
            successScreen.classList.add('active');
            // Trigger confetti
            triggerPhoneConfetti();
        }, 2200);
    });

    resetAppBtn.addEventListener('click', () => {
        shoppingCart = [];
        updateCartUI();
        successScreen.classList.remove('active');
    });

    // Custom CSS confetti splash inside phone frame
    function triggerPhoneConfetti() {
        const confettiCount = 50;
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#06b6d4'];
        
        for (let i = 0; i < confettiCount; i++) {
            const piece = document.createElement('div');
            piece.style.position = 'absolute';
            piece.style.width = '6px';
            piece.style.height = '6px';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.top = '10%';
            piece.style.left = '50%';
            piece.style.borderRadius = '2px';
            piece.style.zIndex = '30';
            piece.style.transform = 'translate(-50%, -50%)';
            phoneScreen.appendChild(piece);
            
            // Animate
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 8 + 4;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - Math.random() * 3; // skewed upward
            
            let posX = phoneScreen.clientWidth / 2;
            let posY = phoneScreen.clientHeight * 0.35;
            let gravity = 0.35;
            
            let rotation = Math.random() * 360;
            let rotVelocity = (Math.random() * 20) - 10;
            
            let elapsed = 0;
            function updateConfetti() {
                posX += vx;
                posY += vy + (gravity * elapsed);
                rotation += rotVelocity;
                elapsed += 0.5;
                
                piece.style.left = posX + 'px';
                piece.style.top = posY + 'px';
                piece.style.transform = `rotate(${rotation}deg)`;
                
                if (posY < phoneScreen.clientHeight && posX > 0 && posX < phoneScreen.clientWidth) {
                    requestAnimationFrame(updateConfetti);
                } else {
                    piece.remove();
                }
            }
            requestAnimationFrame(updateConfetti);
        }
    }


    // ---------------------------------------------------------
    // 5. Web Browser Mockup Dashboard Theme Toggler & Live Refresh
    // ---------------------------------------------------------
    const browserBody = document.querySelector('.browser-body');
    const browserThemeBtn = document.querySelector('.browser-theme-toggle');
    const refreshDashBtn = document.querySelector('.btn-dash-refresh');
    const chartPath = document.querySelector('.chart-line-path');
    
    // Theme toggle in mockup
    browserThemeBtn.addEventListener('click', () => {
        const isLight = browserBody.classList.toggle('light-theme');
        const icon = browserThemeBtn.querySelector('i');
        if (isLight) {
            icon.className = 'fas fa-sun';
            browserThemeBtn.title = 'Switch to Dark Mode';
        } else {
            icon.className = 'fas fa-moon';
            browserThemeBtn.title = 'Switch to Light Mode';
        }
    });

    // Live refresh data update visual logs
    refreshDashBtn.addEventListener('click', () => {
        const refreshIcon = refreshDashBtn.querySelector('i');
        refreshIcon.style.transform = 'rotate(360deg)';
        refreshIcon.style.transition = 'transform 0.8s';
        
        // Randomize numbers
        const revenueCard = document.querySelectorAll('.dash-card h4')[0];
        const sessionsCard = document.querySelectorAll('.dash-card h4')[1];
        
        revenueCard.textContent = '₹' + (800000 + Math.floor(Math.random() * 95000)).toLocaleString('en-IN');
        sessionsCard.textContent = (40000 + Math.floor(Math.random() * 5000)).toLocaleString('en-IN');
        
        // Redraw graph path
        chartPath.style.animation = 'none';
        chartPath.offsetHeight; // trigger reflow
        chartPath.style.animation = 'draw-chart-line 2s ease forwards';

        setTimeout(() => {
            refreshIcon.style.transform = 'rotate(0deg)';
            refreshIcon.style.transition = 'none';
        }, 800);
    });


    // ---------------------------------------------------------
    // 6. Retro Terminal CLI Parser & Operations Log Setup
    // ---------------------------------------------------------
    const termInput = document.querySelector('.terminal-input');
    const termOutput = document.querySelector('.terminal-output');
    const termShortcutBtns = document.querySelectorAll('.term-shortcut-btn');

    function writeTermOutput(text, type = 'system-resp') {
        const line = document.createElement('div');
        line.className = `term-line ${type}`;
        line.innerHTML = text;
        termOutput.appendChild(line);
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    function executeCommand(cmd) {
        cmd = cmd.trim().toLowerCase();
        if (!cmd) return;

        writeTermOutput(`MZ-OS:~$ ${cmd}`, 'user-entered');

        switch(cmd) {
            case 'help':
                writeTermOutput(`
Available Commands:<br>
  <span class="log-success">help</span>     - Display operations guide.<br>
  <span class="log-success">skills</span>   - List technical core stacks.<br>
  <span class="log-success">projects</span> - Display deployed projects list.<br>
  <span class="log-success">stats</span>    - Live multi-branch databases feed.<br>
  <span class="log-success">matrix</span>   - Load digital code drops stream.<br>
  <span class="log-success">clear</span>    - Clear terminal logs.
                `);
                break;
            case 'skills':
                writeTermOutput(`
&gt; Core Technologies & Systems Architecture:
------------------------------------------
Java / Android Studio   [==========] 95%
C# / .NET / WPF          [=========-] 90%
SQL Server / T-SQL       [==========] 95%
React JS / JavaScript    [========--] 85%
Firebase Cloud Sync      [=========-] 90%
Blender 3D Modeling      [=======---] 75%
------------------------------------------
                `);
                break;
            case 'projects':
                writeTermOutput(`
&gt; Deployed Operations Catalog:
-----------------------------------------------------------
1. <b>Impotex E-Commerce</b>  | Platform: Web/Mobile | Status: Deployed
2. <b>Sales Pro POS System</b>  | Platform: WPF Desktop| Status: Active
3. <b>Naseer Leather ERP</b>   | Platform: Enterprise | Status: Synced
4. <b>Smart Restaurant</b>     | Platform: Android App| Status: Operational
-----------------------------------------------------------
                `);
                break;
            case 'stats':
                writeTermOutput('&gt; Spawning remote network monitor channels...');
                let counter = 0;
                const interval = setInterval(() => {
                    const branches = ['Ranipet', 'Chennai', 'Bangalore', 'Vellore'];
                    const activeBranch = branches[Math.floor(Math.random() * branches.length)];
                    const latency = Math.floor(Math.random() * 45) + 12;
                    writeTermOutput(`Node [${activeBranch}] DB sync completed. Integrity: 100% | Latency: ${latency}ms`, 'info');
                    counter++;
                    if (counter >= 4) {
                        clearInterval(interval);
                        writeTermOutput('All active nodes responsive. Database clusters in balance.', 'alert');
                    }
                }, 400);
                break;
            case 'matrix':
                writeTermOutput('&gt; Loading digital rain terminal stream...');
                let rainLine = '';
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        let binary = '';
                        for (let j = 0; j < 36; j++) {
                            binary += Math.random() > 0.5 ? '1' : '0';
                        }
                        writeTermOutput(binary, 'alert');
                    }, i * 200);
                }
                break;
            case 'clear':
                termOutput.innerHTML = '';
                break;
            default:
                writeTermOutput(`bash: command not found: ${cmd}. Type 'help' to review commands.`, 'term-line');
        }
    }

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand(termInput.value);
            termInput.value = '';
        }
    });

    termShortcutBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const cmd = this.getAttribute('data-cmd');
            executeCommand(cmd);
        });
    });


    // ---------------------------------------------------------
    // 7. Interactive Custom Pricing Calculator Timeline Engine
    // ---------------------------------------------------------
    const platformCheckboxes = document.querySelectorAll('.calc-platform-input');
    const featureCheckboxes = document.querySelectorAll('.calc-feature-input');
    const supportSlider = document.querySelector('.support-range-slider');
    
    const sliderLabel = document.querySelector('.slider-label-val');
    const sliderPriceLabel = document.querySelector('.slider-price-val');
    const calculatedPriceLabel = document.querySelector('.calculated-price');
    const calculatedTimelineLabel = document.querySelector('.calculated-timeline');
    const calculatorCTA = document.querySelector('.btn-calculator-cta');

    function calculateEstimate() {
        let totalPrice = 0;
        let totalTimeline = 0;
        let selectedPlatforms = [];
        let selectedFeatures = [];

        // Platforms
        platformCheckboxes.forEach(cb => {
            const label = cb.closest('.calc-checkbox-label');
            const tile = label ? label.querySelector('.calc-tile') : null;
            const title = tile ? tile.querySelector('.tile-title').textContent : '';
            if (cb.checked && title) {
                totalPrice += parseInt(cb.getAttribute('data-price'));
                totalTimeline += parseInt(cb.getAttribute('data-time'));
                selectedPlatforms.push(title);
            }
        });

        // Features
        featureCheckboxes.forEach(cb => {
            const container = cb.closest('.feature-checkbox');
            const featureTextEl = container ? container.querySelector('.feature-text') : null;
            if (featureTextEl) {
                const addPriceEl = featureTextEl.querySelector('.feature-add-price');
                let labelText = featureTextEl.textContent;
                if (addPriceEl) {
                    labelText = labelText.replace(addPriceEl.textContent, '');
                }
                labelText = labelText.trim();
                if (cb.checked) {
                    totalPrice += parseInt(cb.getAttribute('data-price'));
                    totalTimeline += parseInt(cb.getAttribute('data-time'));
                    selectedFeatures.push(labelText);
                }
            }
        });

        // Support Tier
        const supportVal = parseInt(supportSlider.value);
        let supportText = '1 Month Technical Support';
        let supportPrice = 0;
        let supportTime = 0;

        if (supportVal === 2) {
            supportText = '3 Months Technical Support';
            supportPrice = 5000;
            supportTime = 5;
        } else if (supportVal === 3) {
            supportText = '6 Months Technical Support';
            supportPrice = 10000;
            supportTime = 10;
        }

        sliderLabel.textContent = supportText;
        sliderPriceLabel.textContent = supportPrice > 0 ? `+₹${supportPrice.toLocaleString('en-IN')}` : 'Included';
        
        totalPrice += supportPrice;
        totalTimeline += supportTime;

        // If no platforms checked, set everything to zero
        if (selectedPlatforms.length === 0) {
            calculatedPriceLabel.textContent = '₹0';
            calculatedTimelineLabel.textContent = 'Timeline: 0 Working Days';
            calculatorCTA.href = '#';
            calculatorCTA.style.pointerEvents = 'none';
            calculatorCTA.style.opacity = '0.5';
            return;
        } else {
            calculatorCTA.style.pointerEvents = 'auto';
            calculatorCTA.style.opacity = '1';
        }

        // Update labels
        calculatedPriceLabel.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
        calculatedTimelineLabel.textContent = `Timeline: ~${totalTimeline} Working Days`;

        // Update WhatsApp CTA
        const waBase = 'https://wa.me/917397702121';
        const messageText = `Hi Mohammed, I've calculated a custom project quote using your estimator:
- Platforms: ${selectedPlatforms.join(', ')}
- Integrations: ${selectedFeatures.length > 0 ? selectedFeatures.join(', ') : 'None'}
- Support: ${supportText}
- Estimated Quote: ₹${totalPrice.toLocaleString('en-IN')}
- Timeline: ~${totalTimeline} Working Days

Let's discuss starting this project.`;
        
        calculatorCTA.href = `${waBase}?text=${encodeURIComponent(messageText)}`;
    }

    platformCheckboxes.forEach(cb => cb.addEventListener('change', calculateEstimate));
    featureCheckboxes.forEach(cb => cb.addEventListener('change', calculateEstimate));
    supportSlider.addEventListener('input', calculateEstimate);
    calculateEstimate(); // run initial on load


    // ---------------------------------------------------------
    // 8. Project Slides Carousel Logic
    // ---------------------------------------------------------
    const slides = document.querySelectorAll('.project-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        indicators.forEach(i => i.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    indicators.forEach(ind => {
        ind.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-slide'));
            goToSlide(index);
        });
    });

    // Auto load project into simulator logic
    const loadProjectBtns = document.querySelectorAll('.btn-load-project-sim');
    loadProjectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const slide = this.closest('.project-slide');
            const simTarget = slide.getAttribute('data-sim');
            const demoName = slide.getAttribute('data-demo');
            
            const playgroundSec = document.getElementById('playground');
            playgroundSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setTimeout(() => {
                switchSimulator(simTarget);
                // Custom setup inside simulators for projects
                if (simTarget === 'desktop') {
                    termOutput.innerHTML = '';
                    writeTermOutput(`Initializing database schema for [${demoName.toUpperCase()}]...`, 'welcome');
                    if (demoName === 'salespro') {
                        writeTermOutput('Sales Pro Local DB connected. Loading terminal sales transaction cache logs...', 'info');
                        writeTermOutput('Node Sync completed. Total sales logged today: ₹2,42,000 | Invoices generated: 148', 'alert');
                    } else if (demoName === 'naseer') {
                        writeTermOutput('Naseer Leather Operations Hub Initialized.', 'info');
                        writeTermOutput('Executing DB synchronization routine across 5 branches...', 'alert');
                        executeCommand('stats');
                    }
                } else if (simTarget === 'web' && demoName === 'impotex') {
                    // Update Web dashboard with Impotex stats
                    document.querySelectorAll('.dash-card h4')[0].textContent = '₹12,49,200';
                    document.querySelectorAll('.dash-card h4')[1].textContent = '78,412';
                    document.querySelectorAll('.dash-card h4')[2].textContent = '4.12%';
                    refreshDashBtn.click();
                } else if (simTarget === 'android' && demoName === 'restaurant') {
                    // Prepopulate ordering cart drawer
                    shoppingCart = [
                        { name: 'Elite Headphones', price: 4999, qty: 1 },
                        { name: 'Active Smartwatch', price: 2999, qty: 2 }
                    ];
                    updateCartUI();
                    cartDrawer.classList.add('active');
                }
            }, 800);
        });
    });


    // ---------------------------------------------------------
    // 9. Contact Console Form Submission Logging Stream
    // ---------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const overlay = document.querySelector('.transmission-overlay');
    const overlayLogs = document.querySelector('.transmission-console-logs');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const subject = document.getElementById('form-subject').value;
        const msg = document.getElementById('form-message').value;

        // Show console overlay
        overlay.classList.add('active');
        overlayLogs.innerHTML = '';

        const logLines = [
            `sh transmission_portal.sh --target zaidmohammed35@gmail.com --sender ${email}`,
            'Connecting to global messaging server node...',
            'Status: CONNECTED. Resolving SSL validation protocol...',
            'Negotiating RSA-2048 key exchange handshake...',
            'Encrypting request headers metadata...',
            `Payload bundle details:<br>  Name: ${name}<br>  Subject: ${subject}`,
            'Uploading message stream packet (4.12 KB)...',
            'Sending system notification triggers to client channels...',
            'Transmission Successful! Code: 200 OK.'
        ];

        let index = 0;
        function renderLogs() {
            if (index < logLines.length) {
                const lineText = logLines[index];
                const isFirst = index === 0;
                const isLast = index === logLines.length - 1;
                
                let lineType = 'system-resp';
                if (isFirst) lineType = 'log-accent';
                if (isLast) lineType = 'log-success';

                const logItem = document.createElement('div');
                logItem.className = `term-line ${lineType}`;
                logItem.innerHTML = isFirst ? `MZ-OS:~$ ${lineText}` : `&gt; ${lineText}`;
                overlayLogs.appendChild(logItem);
                overlayLogs.scrollTop = overlayLogs.scrollHeight;

                index++;
                setTimeout(renderLogs, isLast ? 800 : Math.random() * 400 + 200);
            } else {
                // Success trigger wait, then redirect and close
                setTimeout(() => {
                    overlay.classList.remove('active');
                    
                    // WhatsApp Redirection
                    const waBase = 'https://wa.me/917397702121';
                    const waMessage = `Hi Mohammed, I'm reaching out through your portfolio contact form:
- Name: ${name}
- Email: ${email}
- Subject: ${subject}
- Message: ${msg}`;
                    
                    window.open(`${waBase}?text=${encodeURIComponent(waMessage)}`, '_blank');
                    contactForm.reset();
                }, 2200);
            }
        }

        setTimeout(renderLogs, 500);
    });

    // Tech badges hover effect triggers simulator tip
    const techBadges = document.querySelectorAll('.tech-badge');
    techBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            const cmd = this.getAttribute('data-cmd');
            // If terminal is active, enter code typing preview
            const isTerminalActive = document.getElementById('sim-desktop').classList.contains('active');
            if (isTerminalActive) {
                termInput.placeholder = `Command: ${cmd.toLowerCase()}`;
            }
        });
        badge.addEventListener('mouseleave', function() {
            termInput.placeholder = 'Type command here...';
        });
        
        badge.addEventListener('click', function() {
            const cmd = this.getAttribute('data-cmd').toLowerCase();
            const playgroundSec = document.getElementById('playground');
            playgroundSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            setTimeout(() => {
                switchSimulator('desktop');
                executeCommand('clear');
                if (cmd.includes('java') || cmd.includes('android')) {
                    executeCommand('skills');
                } else {
                    writeTermOutput(`Query database info for module: [${cmd.toUpperCase()}]...`, 'welcome');
                    writeTermOutput(`Ecosystem module initialized. Supported platforms: Web app API / Cloud database sync models.`, 'info');
                }
            }, 800);
        });
    });
});
