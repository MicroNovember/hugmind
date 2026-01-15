// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_axWhWF5m6x2-r3HY-KDdoiSu-Kff67U",
    authDomain: "pukjai-app.firebaseapp.com",
    projectId: "pukjai-app",
    storageBucket: "pukjai-app.firebasestorage.app",
    messagingSenderId: "942620588150",
    appId: "1:942620588150:web:b7ddd027d8188b3523c757"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    console.log('Firebase config:', firebaseConfig);
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const auth = firebase.auth();

// Test Firebase connection
console.log('Firebase auth object:', auth);
console.log('Firebase auth methods:', Object.getOwnPropertyNames(auth));

// Test Firebase functionality
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed test:', user);
    
    if (user) {
        console.log('User detected in auth state change:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
        });
        
        // ทำให้ผู้ใช้พร้อมใช้งานทั่วโลก
        window.currentUser = user;
        
        // อัปเดต AuthUtils
        if (window.AuthUtils) {
            console.log('Updating AuthUtils with new user');
        }
    } else {
        console.log('No user in auth state change');
        window.currentUser = null;
    }
});

// Alpine.js Auth Component
document.addEventListener('alpine:init', () => {
    console.log('Alpine.js init event fired, creating authApp...');
    
    Alpine.data('authApp', () => {
        console.log('Creating authApp instance...');
        
        const authAppInstance = {
            // Form Data
            form: {
                email: '',
                password: '',
                remember: false
            },
        
        // Journal Entry Form
        journalEntry: {
            title: '',
            content: '',
            mood: '',
            tags: '',
            isPrivate: false
        },
        
        // Validation State
        validation: {
            title: false,
            content: false,
            mood: false,
            tags: false
        },
        
        // Register Form Data
        registerForm: {
            email: '',
            password: '',
            confirmPassword: '',
            agreedToTerms: false
        },
        
        // UI State
        loading: false,
        error: '',
        success: '',
        showPassword: false,
        showConfirmPassword: false,
        showEmailForm: false,
        showGuestModal: false,
        guestAgreed: false,
        darkMode: false,
        
        // Initialize Firebase and check auth state
        init() {
            console.log('Auth init starting...');
            console.log('Firebase auth available:', typeof auth !== 'undefined');
            console.log('Current Firebase user:', auth.currentUser);
            
            // Check for existing session
            auth.onAuthStateChanged((user) => {
                console.log('Auth state changed:', user);
                
                if (user) {
                    console.log('User is signed in:', {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        emailVerified: user.emailVerified
                    });
                    
                    // User is signed in, redirect to main app
                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes('login.html')) {
                        console.log('Redirecting to main app...');
                        this.redirectToApp();
                    }
                } else {
                    console.log('User is signed out');
                }
            });
            
            // Check for guest session
            const guestMode = localStorage.getItem('guestMode') === 'true';
            if (guestMode) {
                console.log('Guest mode detected');
            }
            
            console.log('Auth init completed');
            // Load dark mode preference
            this.darkMode = localStorage.getItem('darkMode') === 'true';
            
            // Load remembered email
            const rememberedEmail = localStorage.getItem('rememberUser');
            if (rememberedEmail) {
                this.form.email = rememberedEmail;
                this.form.remember = true;
            }
        },
        
        // Check if guest is logged in
        isGuestLoggedIn() {
            const guestMode = localStorage.getItem('guestMode') === 'true';
            const guestData = localStorage.getItem('guestData');
            
            if (!guestMode || !guestData) {
                return false;
            }
            
            // Check if guest session is still valid (30 days)
            const data = JSON.parse(guestData);
            const loginTime = new Date(data.loginTime);
            const now = new Date();
            const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > 30) {
                // Guest session expired
                this.clearGuestData();
                return false;
            }
            
            return true;
        },
        
        // Show Guest Agreement Modal
        showGuestAgreement() {
            this.showGuestModal = true;
        },
        
        // Login as Guest
        loginAsGuest() {
            this.loading = true;
            this.error = '';
            
            // สร้าง popup แจ้งเตือนสำหรับการเข้าใช้งานแบบ Guest
            this.showGuestWarningDialog();
        },
        
        // แสดง popup แจ้งเตือนการเข้าใช้งานแบบ Guest
        showGuestWarningDialog() {
            // สร้าง overlay
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            overlay.style.backdropFilter = 'blur(4px)';
            
            // สร้าง popup container
            const popup = document.createElement('div');
            popup.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-95';
            
            popup.innerHTML = `
                <div class="text-center">
                    <!-- Icon -->
                    <div class="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-user-astronaut text-2xl text-blue-600 dark:text-blue-400"></i>
                    </div>
                    
                    <!-- Title -->
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">🚀 เข้าใช้งานแบบ Guest</h3>
                    
                    <!-- Message -->
                    <div class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                        <p class="mb-3">⚠️ <strong>คำเตือนเกี่ยวกับการใช้งานแบบ Guest:</strong></p>
                        <div class="text-left space-y-2">
                            <div class="flex items-start">
                                <i class="fas fa-mobile-alt text-blue-500 mt-1 mr-2"></i>
                                <span>📱 ข้อมูลของคุณจะถูกเก็บไว้เฉพาะในอุปกรณ์นี้เท่านั้น</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-sync-alt text-blue-500 mt-1 mr-2"></i>
                                <span>🔒 ไม่สามารถซิงค์ข้อมูลข้ามอุปกรณ์ได้</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-trash-alt text-blue-500 mt-1 mr-2"></i>
                                <span>🗑️ การลบแคช/คุกกี้/ใช้เบราว์เซอร์อื่นจะทำให้ข้อมูลหายไป</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-exchange-alt text-blue-500 mt-1 mr-2"></i>
                                <span>📱 การเปลี่ยนอุปกรณ์จะทำให้ข้อมูลสูญหายไป</span>
                            </div>
                            <div class="flex items-start">
                                <i class="fas fa-shield-alt text-blue-500 mt-1 mr-2"></i>
                                <span>🔐 แนะนำให้สมัครสมาชิกเพื่อความปลอดภัยข้อมูล</span>
                            </div>
                        </div>
                        <p class="mt-3 font-semibold">คุณยอมรับเงื่อนไขและเข้าใจใจข้อความเสี่ยงเหล่านี้หรือไม่?</p>
                    </div>
                    
                    <!-- Buttons -->
                    <div class="flex gap-3 justify-center">
                        <button id="cancelBtn" class="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-200 flex items-center">
                            <i class="fas fa-times mr-2"></i>
                            ยกเลิก
                        </button>
                        <button id="confirmBtn" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center">
                            <i class="fas fa-user-astronaut mr-2"></i>
                            ยอมรับและเข้าใช้งาน
                        </button>
                    </div>
                </div>
            `;
            
            // เพิ่ม popup ไปยัง overlay
            overlay.appendChild(popup);
            document.body.appendChild(overlay);
            
            // แสดง popup ด้วย animation
            setTimeout(() => {
                popup.classList.remove('scale-95');
                popup.classList.add('scale-100');
            }, 10);
            
            // Event listeners
            const cancelBtn = document.getElementById('cancelBtn');
            const confirmBtn = document.getElementById('confirmBtn');
            
            cancelBtn.addEventListener('click', () => {
                this.closeGuestWarningDialog(overlay, () => {
                    this.loading = false;
                    this.error = 'คุณต้องยอมรับเงื่อนไขเพื่อเข้าใช้งานแบบ Guest';
                });
            });
            
            confirmBtn.addEventListener('click', () => {
                this.closeGuestWarningDialog(overlay, () => {
                    this.proceedWithGuestLogin();
                });
            });
            
            // ปิด popup เมื่อคลิก overlay
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeGuestWarningDialog(overlay, () => {
                        this.loading = false;
                        this.error = 'คุณต้องยอมรับเงื่อนไขเพื่อเข้าใช้งานแบบ Guest';
                    });
                }
            });
            
            // ปิด popup เมื่อกด Escape
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.closeGuestWarningDialog(overlay, () => {
                        this.loading = false;
                        this.error = 'คุณต้องยอมรับเงื่อนไขเพื่อเข้าใช้งานแบบ Guest';
                    });
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        },
        
        // ปิด popup แจ้งเตือน Guest
        closeGuestWarningDialog(overlay, callback) {
            const popup = overlay.querySelector('div');
            popup.classList.remove('scale-100');
            popup.classList.add('scale-95');
            
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (callback) callback();
            }, 300);
        },
        
        // ดำเนินการ login แบบ Guest
        proceedWithGuestLogin() {
            // Clear any existing auth data
            this.clearAllAuthData();
            
            // Set guest mode in localStorage
            localStorage.setItem('guestMode', 'true');
            localStorage.setItem('userType', 'guest');
            localStorage.setItem('guestLoginTime', new Date().toISOString());
            
            // Create guest user data
            const guestData = {
                uid: 'guest_' + Date.now(),
                email: 'guest@cloudypukjai.local',
                displayName: 'Guest User',
                photoURL: null,
                agreedAt: new Date().toISOString(),
                deviceInfo: navigator.userAgent,
                loginWarning: true
            };
            
            localStorage.setItem('guestData', JSON.stringify(guestData));
            
            // Show success message briefly
            this.success = '✅ เข้าสู่ระบบแบบ Guest สำเร็จแล้ว';
            setTimeout(() => {
                this.success = '';
            }, 3000);
            
            this.loading = false;
            
            // Redirect to main app
            this.redirectToApp();
        },
        
        // Debug Register Function
        debugRegister() {
            console.log('=== DEBUG REGISTER START ===');
            console.log('Current form data:', this.registerForm);
            console.log('Loading state:', this.loading);
            console.log('Error state:', this.error);
            console.log('Success state:', this.success);
            console.log('Agreed to terms:', this.registerForm.agreedToTerms);
            
            // ตรวจสอบ Firebase
            console.log('=== FIREBASE CHECK ===');
            console.log('Firebase auth available:', typeof auth !== 'undefined');
            console.log('Firebase auth object:', auth);
            console.log('Firebase current user:', auth.currentUser);
            console.log('Firebase auth methods:', Object.getOwnPropertyNames(auth).slice(0, 10));
            
            // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
            const validation = {
                email: !!this.registerForm.email,
                password: !!this.registerForm.password,
                confirmPassword: !!this.registerForm.confirmPassword,
                agreedToTerms: !!this.registerForm.agreedToTerms
            };
            
            console.log('Validation check:', validation);
            
            // ตรวจสอบว่าข้อมูลถูกต้องหรือไม่
            const validationDetails = {
                emailFormat: this.registerForm.email?.includes('@') || false,
                passwordLength: this.registerForm.password?.length || 0,
                passwordsMatch: this.registerForm.password === this.registerForm.confirmPassword
            };
            
            console.log('Validation details:', validationDetails);
            
            // ตรวจสอบว่าสามารถเรียก register() ได้หรือไม่
            console.log('Register function type:', typeof this.register);
            
            // ตรวจสอบว่ามี error หรือไม่
            if (this.error) {
                console.log('Current error:', this.error);
            }
            
            // ตรวจสอบว่ามี success หรือไม่
            if (this.success) {
                console.log('Current success:', this.success);
            }
            
            console.log('=== DEBUG REGISTER END ===');
            
            // ถ้ามีข้อมูลครบถ้วน ให้ลองเรียก register()
            if (validation.email && validation.password && validation.confirmPassword && validation.agreedToTerms) {
                console.log('All data available, attempting to call register()...');
                this.register();
            } else {
                console.log('Missing data, cannot call register()');
                this.error = 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนกด Debug';
            }
        },
        
        // Generate Guest ID
        generateGuestId() {
            return 'guest_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        },
        
        // Register with Email/Password
        async register() {
            // Clear previous messages
            this.error = '';
            this.success = '';
            
            console.log('Register function called');
            console.log('Register form data:', this.registerForm);
            
            // Validate form
            if (!this.registerForm.email || !this.registerForm.password || !this.registerForm.confirmPassword) {
                this.error = 'กรุณากรอกข้อมูลให้ครบถ้วน';
                console.log('Validation failed: missing fields');
                return;
            }
            
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.error = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
                console.log('Validation failed: passwords do not match');
                return;
            }
            
            if (this.registerForm.password.length < 6) {
                this.error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
                console.log('Validation failed: password too short');
                return;
            }
            
            if (!this.registerForm.agreedToTerms) {
                this.error = 'กรุณายอมรับเงื่อนไขการใช้งาน';
                console.log('Validation failed: terms not agreed');
                return;
            }
            
            this.loading = true;
            console.log('Starting Firebase registration...');
            
            try {
                // Create user with Firebase
                console.log('Creating user with email:', this.registerForm.email);
                const userCredential = await auth.createUserWithEmailAndPassword(
                    this.registerForm.email, 
                    this.registerForm.password
                );
                
                const user = userCredential.user;
                console.log('User created successfully:', user);
                
                // ไม่ต้องอัปเดต profile ด้วย displayName ใช้ email แทน
                console.log('Using email as display name');
                
                console.log('Registration completed successfully');
                console.log('User registered:', {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.email, // ใช้ email เป็น displayName
                    emailVerified: user.emailVerified
                });
                
                this.success = 'สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                console.log('Registration successful, redirecting...');
                
                // Redirect after successful registration
                setTimeout(() => {
                    this.redirectToApp();
                }, 2000);
                
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Register with Google
        async registerWithGoogle() {
            this.loading = true;
            this.error = '';
            this.success = '';
            
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                
                const result = await auth.signInWithPopup(provider);
                const user = result.user;
                
                console.log('Google user registered:', {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
                
                this.success = 'เชื่อมต่อ Google สำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                
                setTimeout(() => {
                    this.redirectToApp();
                }, 2000);
                
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Login with Email/Password
        async login() {
            if (!this.form.email || !this.form.password) {
                this.error = 'กรุณากรอกอีเมลและรหัสผ่าน';
                return;
            }
            
            this.loading = true;
            this.error = '';
            
            try {
                // Clear any existing guest data
                this.clearGuestData();
                
                // Sign in with Firebase
                await auth.signInWithEmailAndPassword(this.form.email, this.form.password);
                
                // Remember me functionality
                if (this.form.remember) {
                    localStorage.setItem('rememberUser', this.form.email);
                } else {
                    localStorage.removeItem('rememberUser');
                }
                
                this.redirectToApp();
                
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Login with Google
        async loginWithGoogle() {
            this.loading = true;
            this.error = '';
            
            try {
                // Clear any existing guest data
                this.clearGuestData();
                
                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');
                
                await auth.signInWithPopup(provider);
                
                this.redirectToApp();
            } catch (error) {
                this.handleAuthError(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Redirect to App
        redirectToApp() {
            console.log('redirectToApp() called');
            console.log('Current URL:', window.location.href);
            console.log('Current pathname:', window.location.pathname);
            
            // รอให้ auth state อัปเดตก่อน redirect
            setTimeout(() => {
                console.log('Checking auth state before redirect...');
                console.log('Firebase auth.currentUser:', auth.currentUser);
                console.log('Global currentUser:', window.currentUser);
                
                if (auth.currentUser || window.currentUser) {
                    console.log('User is authenticated, redirecting to index.html...');
                    // Only redirect if not already on index page
                    if (!window.location.pathname.includes('index.html')) {
                        window.location.href = 'index.html';
                    } else {
                        console.log('Already on index.html, no redirect needed');
                    }
                } else {
                    console.log('User not authenticated, waiting...');
                    // รออีกครั้ง
                    setTimeout(() => {
                        if (auth.currentUser || window.currentUser) {
                            console.log('User authenticated after delay, redirecting...');
                            if (!window.location.pathname.includes('index.html')) {
                                window.location.href = 'index.html';
                            }
                        } else {
                            console.log('User still not authenticated, forcing redirect...');
                            if (!window.location.pathname.includes('index.html')) {
                                window.location.href = 'index.html';
                            }
                        }
                    }, 2000);
                }
            }, 1000);
        },
        
        // Validate Journal Entry
        validateJournalEntry() {
            this.validation.title = !this.journalEntry.title || this.journalEntry.title.length < 3;
            this.validation.content = !this.journalEntry.content || this.journalEntry.content.length < 10;
            this.validation.mood = !this.journalEntry.mood;
            this.validation.tags = !this.journalEntry.tags;
            
            // Check for inappropriate content
            const inappropriateWords = ['คำหยาบ', 'คำไม่สุภาพ', 'คำหยาม', 'ขาย', 'โง่', 'เหี้ยน', 'fuck', 'shit', 'damn'];
            const hasInappropriateContent = inappropriateWords.some(word => 
                this.journalEntry.title.toLowerCase().includes(word) || 
                this.journalEntry.content.toLowerCase().includes(word)
            );
            
            if (hasInappropriateContent) {
                this.validation.title = true;
                this.validation.content = true;
                this.error = '⚠️ กรุณากรอกข้อมูลที่เหมาะสม ไม่เหมาะสม หรือมีคำที่ไม่เหมาะสม';
                return false;
            }
            
            return !this.validation.title && !this.validation.content && this.validation.mood;
        },
        
        // Save Journal Entry
        saveJournalEntry() {
            if (!this.validateJournalEntry()) {
                return;
            }
            
            this.loading = true;
            this.error = '';
            
            try {
                // Get existing journal entries
                const existingEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                
                // Create new entry
                const newEntry = {
                    id: Date.now().toString(),
                    title: this.journalEntry.title.trim(),
                    content: this.journalEntry.content.trim(),
                    mood: this.journalEntry.mood,
                    tags: this.journalEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    isPrivate: this.journalEntry.isPrivate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Add to entries array
                existingEntries.unshift(newEntry);
                
                // Keep only last 100 entries
                if (existingEntries.length > 100) {
                    existingEntries.splice(100);
                }
                
                // Save to localStorage
                localStorage.setItem('journalEntries', JSON.stringify(existingEntries));
                
                // Clear form
                this.journalEntry = {
                    title: '',
                    content: '',
                    mood: '',
                    tags: '',
                    isPrivate: false
                };
                
                this.validation = {
                    title: false,
                    content: false,
                    mood: false,
                    tags: false
                };
                
                this.success = '✅ บันทึกข้อมูลสำเร็จแล้ว';
                setTimeout(() => {
                    this.success = '';
                }, 3000);
                
            } catch (error) {
                this.error = '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message;
            } finally {
                this.loading = false;
            }
        },
        
        // Clear Guest Data
        clearGuestData() {
            localStorage.removeItem('guestMode');
            localStorage.removeItem('guestData');
            localStorage.removeItem('userType');
            localStorage.removeItem('guestLoginTime');
        },
        
        // Clear All Auth Data
        clearAllAuthData() {
            this.clearGuestData();
            localStorage.removeItem('rememberUser');
        },
        
        // Handle Authentication Errors
        handleAuthError(error) {
            console.error('Auth error:', error);
            
            const errorMessages = {
                'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบอีเมล',
                'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่',
                'auth/invalid-email': 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ',
                'auth/user-disabled': 'บัญชีผู้ใช้ถูกระงับการใช้งาน',
                'auth/too-many-requests': 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
                'auth/network-request-failed': 'การเชื่อมต่อล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต',
                'auth/popup-closed-by-user': 'ปิดหน้าต่างการเข้าสู่ระบบ กรุณาลองใหม่',
                'auth/popup-blocked': 'หน้าต่างถูกบล็อก กรุณาอนุญาต popup และลองใหม่',
                'auth/cancelled-popup-request': 'ยกเลิกการเข้าสู่ระบบ กรุณาลองใหม่',
                'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ',
                'auth/weak-password': 'รหัสผ่านอ่อนเกินไป กรุณาใช้รหัสผ่านที่ซับซ้อนมากขึ้น',
                'auth/invalid-credential': 'ข้อมูลรับรองไม่ถูกต้อง กรุณาลองใหม่'
            };
            
            this.error = errorMessages[error.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        },
        
        // Toggle Dark Mode
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
        },
        
        // Utility: Format date
        formatDate(date) {
            return new Intl.DateTimeFormat('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(date));
        }
    };
        
        console.log('authApp instance created, making it globally available');
        window.authApp = authAppInstance;
        
        return authAppInstance;
    });
});

// Utility functions for auth management
window.AuthUtils = {
    // Get current user info
    getCurrentUser() {
        console.log('AuthUtils.getCurrentUser() called');
        console.log('Firebase auth.currentUser:', auth.currentUser);
        console.log('Global currentUser:', window.currentUser);
        
        // ตรวจสอบ Guest Mode ก่อน
        const guestMode = localStorage.getItem('guestMode');
        const guestData = localStorage.getItem('guestData');
        
        if (guestMode === 'true' && guestData) {
            try {
                const guestUser = JSON.parse(guestData);
                console.log('Guest user found:', guestUser);
                
                // ตรวจสอบว่า guest ยังไม่หมดอายุ (30 วัน)
                const loginTime = new Date(guestUser.loginTime);
                const now = new Date();
                const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
                
                if (daysDiff < 30) {
                    console.log('Guest user is valid, returning guest user');
                    return {
                        uid: guestUser.uid,
                        email: guestUser.email,
                        displayName: guestUser.displayName,
                        photoURL: guestUser.photoURL,
                        isGuest: true,
                        sessionId: guestUser.sessionId
                    };
                } else {
                    console.log('Guest user expired, clearing guest data');
                    localStorage.removeItem('guestMode');
                    localStorage.removeItem('guestData');
                    localStorage.removeItem('guestLoginTime');
                    localStorage.removeItem('userType');
                }
            } catch (error) {
                console.error('Error parsing guest data:', error);
                localStorage.removeItem('guestMode');
                localStorage.removeItem('guestData');
            }
        }
        
        // ใช้ global currentUser ก่อน (จาก auth state change)
        let user = window.currentUser || auth.currentUser;
        
        if (user) {
            // สำหรับผู้ใช้ Firebase ให้ใช้ email เป็น displayName เสมอ
            const displayName = user.email || 'User';
            
            console.log('Firebase user data:', {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                photoURL: user.photoURL,
                isGuest: false
            });
            
            return {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                photoURL: user.photoURL,
                isGuest: false
            };
        }
        
        console.log('No user found');
        return null;
    },
    
    // Login with Email/Password
    async login(email, password) {
        console.log('AuthUtils.login called');
        
        try {
            // Check if Firebase is available
            if (!auth) {
                throw new Error('Firebase auth not initialized');
            }
            
            console.log('Attempting Firebase login with email:', email);
            
            // Sign in with Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Firebase login successful:', user);
            
            // Clear any existing guest data
            this.clearGuestData();
            
            // Set remember me functionality
            const rememberMe = localStorage.getItem('rememberUser') === email;
            if (rememberMe) {
                localStorage.setItem('rememberUser', email);
            }
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.email || user.displayName || 'User',
                    photoURL: user.photoURL,
                    isGuest: false
                }
            };
            
        } catch (error) {
            console.error('Firebase login error:', error);
            
            // Return error details
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    },
    
    // Get error message from Firebase error
    getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาตรวจสอบอีเมล',
            'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่',
            'auth/invalid-email': 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบรูปแบบ',
            'auth/user-disabled': 'บัญชีผู้ใช้ถูกระงับการใช้งาน',
            'auth/too-many-requests': 'พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
            'auth/network-request-failed': 'การเชื่อมต่อล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต',
            'auth/invalid-credential': 'ข้อมูลรับรองไม่ถูกต้อง กรุณาลองใหม่'
        };
        
        return errorMessages[error.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
    },
    
    // Clear Guest Data
    clearGuestData() {
        localStorage.removeItem('guestMode');
        localStorage.removeItem('guestData');
        localStorage.removeItem('userType');
        localStorage.removeItem('guestLoginTime');
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return auth.currentUser !== null || localStorage.getItem('guestMode') === 'true';
    },
    
    // Logout
    async logout() {
        try {
            // Check if guest
            const isGuest = localStorage.getItem('guestMode') === 'true';
            
            if (isGuest) {
                // Clear guest data
                localStorage.removeItem('guestMode');
                localStorage.removeItem('guestData');
                localStorage.removeItem('userType');
                localStorage.removeItem('guestLoginTime');
            } else {
                // Logout from Firebase
                await auth.signOut();
            }
            
            // Clear remember me
            localStorage.removeItem('rememberUser');
            
            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even on error
            window.location.href = 'login.html';
        }
    },
    
    // Get session info
    getSessionInfo() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        return {
            user,
            isGuest: user.isGuest,
            loginTime: user.isGuest ? user.loginTime : new Date().toISOString(),
            sessionDuration: user.isGuest ? '30 days' : 'Until logout'
        };
    }
};

// Export for global access
window.auth = auth;
window.firebase = firebase;
