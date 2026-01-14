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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Alpine.js Auth Component
document.addEventListener('alpine:init', () => {
    Alpine.data('authApp', () => ({
        // Form Data
        form: {
            email: '',
            password: '',
            remember: false
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
        
        // Initialize
        init() {
            // Check for existing session
            auth.onAuthStateChanged((user) => {
                if (user) {
                    // User is signed in, redirect to main app
                    // Only redirect if not already on login page
                    if (!window.location.pathname.includes('login.html')) {
                        this.redirectToApp();
                    }
                }
            });
            
            // Check for guest session
            if (this.isGuestLoggedIn()) {
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('login.html')) {
                    this.redirectToApp();
                }
            }
            
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
            this.guestAgreed = false;
            this.error = '';
        },
        
        // Login as Guest
        loginAsGuest() {
            if (!this.guestAgreed) {
                this.error = 'กรุณายอมรับเงื่อนไขการใช้งานแบบ Guest';
                return;
            }
            
            this.loading = true;
            this.error = '';
            
            try {
                // Clear any existing auth data
                this.clearAllAuthData();
                
                // Set guest mode in localStorage
                localStorage.setItem('guestMode', 'true');
                localStorage.setItem('userType', 'guest');
                localStorage.setItem('guestLoginTime', new Date().toISOString());
                
                // Create guest user data
                const guestData = {
                    isGuest: true,
                    loginTime: new Date().toISOString(),
                    sessionId: this.generateGuestId(),
                    agreedToTerms: true,
                    agreedAt: new Date().toISOString()
                };
                
                localStorage.setItem('guestData', JSON.stringify(guestData));
                
                // Show success message briefly
                setTimeout(() => {
                    this.redirectToApp();
                }, 1000);
                
            } catch (error) {
                this.error = 'ไม่สามารถเข้าใช้งานแบบ Guest ได้ กรุณาลองใหม่';
                this.loading = false;
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
            
            // Validate form
            if (!this.registerForm.email || !this.registerForm.password || !this.registerForm.confirmPassword) {
                this.error = 'กรุณากรอกข้อมูลให้ครบถ้วน';
                return;
            }
            
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                this.error = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
                return;
            }
            
            if (this.registerForm.password.length < 6) {
                this.error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
                return;
            }
            
            if (!this.registerForm.agreedToTerms) {
                this.error = 'กรุณายอมรับเงื่อนไขการใช้งาน';
                return;
            }
            
            this.loading = true;
            
            try {
                // Create user with Firebase
                const userCredential = await auth.createUserWithEmailAndPassword(
                    this.registerForm.email, 
                    this.registerForm.password
                );
                
                const user = userCredential.user;
                
                console.log('User registered:', {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified
                });
                
                this.success = 'สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...';
                
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
            // Add a small delay to show loading state
            setTimeout(() => {
                // Only redirect if not already on index page
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
            }, 500);
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
    }));
});

// Utility functions for auth management
window.AuthUtils = {
    // Get current user info
    getCurrentUser() {
        const user = auth.currentUser;
        if (user) {
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                isGuest: false
            };
        }
        
        // Check guest mode
        const guestMode = localStorage.getItem('guestMode') === 'true';
        if (guestMode) {
            const guestData = JSON.parse(localStorage.getItem('guestData') || '{}');
            return {
                uid: guestData.sessionId,
                displayName: 'Guest User',
                email: 'guest@local',
                photoURL: null,
                isGuest: true,
                loginTime: guestData.loginTime,
                sessionId: guestData.sessionId
            };
        }
        
        return null;
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
