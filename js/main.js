document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element and context - الحصول على عنصر الكانفاس والسياق
    // This selects the canvas element and gets its 2D context for drawing
    // هذا يحدد عنصر الكانفاس ويحصل على سياق الرسم ثنائي الأبعاد
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas to full window size - ضبط حجم الكانفاس على حجم النافذة بالكامل
    // Makes the canvas cover the entire viewport
    // يجعل الكانفاس يغطي نافذة العرض بالكامل
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas when window size changes - تغيير حجم الكانفاس عند تغير حجم النافذة
    // Updates canvas dimensions when the browser window is resized
    // يحدث أبعاد الكانفاس عند تغيير حجم نافذة المتصفح
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Star class with subtler shining effect - فئة النجم مع تأثير توهج أكثر دقة
    // Defines the Star object with properties and methods for the animated stars
    // يحدد كائن النجم مع الخصائص والطرق للنجوم المتحركة
    class Star {
        constructor() {
            // Initialize star properties - تهيئة خصائص النجم
            // Random position, size, brightness and animation settings
            // موضع عشوائي، حجم، سطوع وإعدادات الحركة
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = 0.3 + Math.random() * 1.8;
            this.twinkleSpeed = 0.02 + Math.random() * 0.05;
            this.brightness = 0.2 + Math.random() * 0.3;
            this.maxBrightness = 0.5 + Math.random() * 0.3;
            this.increasing = true;
            // Reduced glow size for subtler effect - حجم توهج مخفض لتأثير أدق
            this.glowSize = this.size * (1.2 + Math.random() * 1.8);
            // Add movement to stars - إضافة حركة للنجوم
            this.speed = 0.1 + Math.random() * 0.1;
            
            // Add color variation for stars - إضافة تنوع ألوان للنجوم
            // Some stars have a blue tint, others are white
            // بعض النجوم لها صبغة زرقاء، والبعض الآخر أبيض
            this.colorHue = Math.random() > 0.8 ? 210 + Math.random() * 30 : 0; // Some stars are blue-ish
            this.colorSaturation = this.colorHue > 0 ? 70 + Math.random() * 30 : 0; // Saturation for colored stars
        }

        update() {
            // Subtle twinkle effect - تأثير وميض خفيف
            // Creates the twinkling animation by changing brightness
            // ينشئ حركة الوميض عن طريق تغيير السطوع
            if (this.increasing) {
                this.brightness += this.twinkleSpeed;
                if (this.brightness >= this.maxBrightness) {
                    this.increasing = false;
                }
            } else {
                this.brightness -= this.twinkleSpeed;
                if (this.brightness <= 0.2) {
                    this.increasing = true;
                }
            }
            
            // Move stars slowly across the screen - تحريك النجوم ببطء عبر الشاشة
            // Makes stars drift downward to create parallax effect
            // يجعل النجوم تنجرف لأسفل لإنشاء تأثير المنظور المتوازي
            this.y += this.speed;
            
            // Reset star position when it goes off screen - إعادة ضبط موضع النجم عندما يخرج من الشاشة
            // Repositions stars that move beyond the bottom of screen
            // يعيد تموضع النجوم التي تتحرك خارج أسفل الشاشة
            if (this.y > canvas.height) {
                this.y = 0;
                this.x = Math.random() * canvas.width;
            }
        }

        draw() {
            // Set star color based on hue - تعيين لون النجم بناءً على الصبغة
            // Determines color based on the random hue and saturation
            // يحدد اللون بناءً على الصبغة والتشبع العشوائي
            const starColor = this.colorHue > 0 
                ? `hsla(${this.colorHue}, ${this.colorSaturation}%, 80%, ${this.brightness * 0.8})`
                : `rgba(255, 255, 255, ${this.brightness * 0.8})`;
            
            const starCoreColor = this.colorHue > 0 
                ? `hsla(${this.colorHue}, ${this.colorSaturation}%, 90%, ${this.brightness + 0.2})`
                : `rgba(255, 255, 255, ${this.brightness + 0.2})`;
            
            // Draw subtle glow effect - رسم تأثير توهج خفيف
            // Creates a soft radial gradient around the star
            // ينشئ تدرجًا إشعاعيًا ناعمًا حول النجم
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0, 
                this.x, this.y, this.glowSize
            );
            gradient.addColorStop(0, starColor);
            gradient.addColorStop(0.5, `rgba(200, 220, 255, ${this.brightness * 0.15})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw core of star - رسم نواة النجم
            // Draws the bright center point of the star
            // يرسم النقطة المركزية المضيئة للنجم
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = starCoreColor;
            ctx.fill();
        }
    }

    // Meteor class - فئة النيزك
    // Defines the Meteor object for shooting star animations
    // يحدد كائن النيزك لحركات النجوم المتساقطة
    class Meteor {
        constructor() {
            this.reset();
            this.progress = 0;
            // Increase duration for slower fall - زيادة المدة لسقوط أبطأ
            this.duration = 5 + Math.random() * 12; // 8-20 seconds - 8-20 ثانية
            this.startTime = Date.now();
            
            // Add color variation - إضافة تنوع الألوان
            // Blue to purple hues for meteors - تدرجات من الأزرق إلى الأرجواني للنيازك
            this.colorHue = 200 + Math.random() * 40;
        }

        reset() {
            // Random position from top - موضع عشوائي من الأعلى
            // Sets starting position for meteors at the top of screen
            // يضبط موضع البداية للنيازك في أعلى الشاشة
            this.x = canvas.width * (0.09 + Math.random() * 0.9); // 9%-99% of width - 9%-99% من العرض
            this.y = -300; // Start above screen - البدء فوق الشاشة
            
            // Target position (diagonal down-right) - موضع الهدف (قطري لأسفل اليمين)
            // Sets the ending point for meteor trajectory
            // يضبط نقطة النهاية لمسار النيزك
            this.endX = this.x + 600;
            this.endY = this.y + 600;
            
            // Current position - الموضع الحالي
            this.currentX = this.x;
            this.currentY = this.y;
            
            // Animation properties - خصائص الحركة
            // Visual appearance and animation timing for the meteor
            // المظهر المرئي وتوقيت الحركة للنيزك
            this.length = 300; // Fixed length like SCSS - طول ثابت مثل SCSS
            this.width = 1;
            this.opacity = 1;
            this.startTime = Date.now();
            // Increase duration for slower fall - زيادة المدة لسقوط أبطأ
            this.duration = 5 + Math.random() * 12; // 8-20 seconds - 8-20 ثانية
            
            // Regenerate color for each meteor - إعادة توليد اللون لكل نيزك
            this.colorHue = 200 + Math.random() * 40;
        }

        update() {
            // Calculate progress based on elapsed time - حساب التقدم بناءً على الوقت المنقضي
            // Determines animation progress (0 to 1) based on time
            // يحدد تقدم الحركة (0 إلى 1) بناءً على الوقت
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.progress = elapsed / this.duration;
            
            // Reset meteor if animation completes - إعادة ضبط النيزك إذا اكتملت الحركة
            if (this.progress > 1) {
                this.reset();
                return;
            }
            
            // Animate position (like SCSS keyframes) - تحريك الموضع (مثل إطارات SCSS الرئيسية)
            // Make meteors stay visible longer by increasing the fade threshold
            // جعل النيازك تبقى مرئية لفترة أطول عن طريق زيادة عتبة التلاشي
            if (this.progress < 0.85) {
                // Maintain full opacity for most of the animation - الحفاظ على التعتيم الكامل لمعظم الحركة
                this.opacity = 1;
            } else {
                // Only fade out at the very end - التلاشي فقط في النهاية تمامًا
                this.opacity = 1 - ((this.progress - 0.85) / 0.15);
            }
            
            // Slow down the movement by using a smaller fraction of the progress
            // إبطاء الحركة باستخدام جزء أصغر من التقدم
            this.currentX = this.x + (this.endX - this.x) * (this.progress / 0.9);
            this.currentY = this.y + (this.endY - this.y) * (this.progress / 0.9);
        }

        draw() {
            // Skip drawing if meteor is not visible - تخطي الرسم إذا كان النيزك غير مرئي
            if (this.opacity <= 0) return;
            
            // Base color with hue variation - اللون الأساسي مع تنوع الصبغة
            // Sets color for the meteor based on its hue property
            // يضبط لون النيزك بناءً على خاصية الصبغة
            const baseColor = `hsla(${this.colorHue}, 80%, 70%, ${this.opacity})`;
            const fadeColor = `hsla(${this.colorHue}, 80%, 70%, 0)`;
            
            // Draw meteor line with color variation - رسم خط النيزك مع تنوع اللون
            // Draws the meteor trail behind the meteor head
            // يرسم ذيل النيزك خلف رأس النيزك
            const angle = Math.atan2(this.endY - this.y, this.endX - this.x);
            const endX = this.currentX - Math.cos(angle) * this.length;
            const endY = this.currentY - Math.sin(angle) * this.length;
            
            // Create gradient for the meteor trail - إنشاء تدرج للذيل النيزك
            const gradient = ctx.createLinearGradient(
                this.currentX, this.currentY,
                endX, endY
            );
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, fadeColor);
            
            // Draw the trail line - رسم خط الذيل
            ctx.beginPath();
            ctx.moveTo(this.currentX, this.currentY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.width;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Draw meteor head with color variation - رسم رأس النيزك مع تنوع اللون
            // Creates a small bright circle at the front of the meteor
            // ينشئ دائرة صغيرة مشرقة في مقدمة النيزك
            ctx.beginPath();
            ctx.arc(this.currentX, this.currentY, 2, 0, Math.PI * 2);
            ctx.fillStyle = baseColor;
            ctx.fill();
            
            // Glow effect with color variation - تأثير التوهج مع تنوع اللون
            // Adds a soft glow around the meteor head
            // يضيف توهجًا ناعمًا حول رأس النيزك
            const glowGradient = ctx.createRadialGradient(
                this.currentX, this.currentY, 0,
                this.currentX, this.currentY, 5
            );
            glowGradient.addColorStop(0, baseColor);
            glowGradient.addColorStop(1, fadeColor);
            
            ctx.beginPath();
            ctx.arc(this.currentX, this.currentY, 5, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
        }
    }

    // Create stars and meteors - إنشاء النجوم والنيازك
    // Initialize the arrays of stars and meteors with random properties
    // تهيئة مصفوفات النجوم والنيازك بخصائص عشوائية
    const stars = [];
    const numStars = 300; // $s value from SCSS - قيمة $s من SCSS
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }

    const meteors = [];
    const numMeteors = 15; // $n value from SCSS - قيمة $n من SCSS
    for (let i = 0; i < numMeteors; i++) {
        meteors.push(new Meteor());
    }

    // Animation loop - حلقة الحركة
    // Main render loop that runs continuously to update and draw the animation
    // حلقة العرض الرئيسية التي تعمل باستمرار لتحديث ورسم الحركة
    function animate() {
        // Clear the canvas with a transparent background - مسح الكانفاس بخلفية شفافة
        // The actual background is now handled by CSS - الخلفية الفعلية يتم التعامل معها الآن بواسطة CSS
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw stars - تحديث ورسم النجوم
        // Process all stars in the array
        // معالجة جميع النجوم في المصفوفة
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        // Update and draw meteors - تحديث ورسم النيازك
        // Process all meteors in the array
        // معالجة جميع النيازك في المصفوفة
        meteors.forEach(meteor => {
            meteor.update();
            meteor.draw();
        });

        // Request next animation frame - طلب إطار الحركة التالي
        // Creates a continuous animation loop
        // ينشئ حلقة حركة مستمرة
        requestAnimationFrame(animate);
    }

    // Start the animation - بدء الحركة
    animate();
});