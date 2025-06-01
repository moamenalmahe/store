// Import node-fetch using dynamic import
(async () => {
    const fetch = (await import('node-fetch')).default;
    
    async function testAuth() {
        const baseUrl = 'http://localhost:3000/api';
        
        // Test registration
        console.log('\nTesting registration...');
        try {
            const registerResponse = await fetch(`${baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'Test123!@#'
                })
            });
            
            const registerData = await registerResponse.json();
            console.log('Registration response:', registerData);
            
            if (registerResponse.ok) {
                // Test login with registered user
                console.log('\nTesting login with registered user...');
                const loginResponse = await fetch(`${baseUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'testuser',
                        password: 'Test123!@#'
                    })
                });
                
                const loginData = await loginResponse.json();
                console.log('Login response:', loginData);
            }
            
            // Test login with wrong password
            console.log('\nTesting login with wrong password...');
            const wrongLoginResponse = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'wrongpassword'
                })
            });
            
            const wrongLoginData = await wrongLoginResponse.json();
            console.log('Wrong password login response:', wrongLoginData);
            
            // Test login with non-existent user
            console.log('\nTesting login with non-existent user...');
            const nonExistentResponse = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'nonexistentuser',
                    password: 'Test123!@#'
                })
            });
            
            const nonExistentData = await nonExistentResponse.json();
            console.log('Non-existent user login response:', nonExistentData);
            
        } catch (error) {
            console.error('Test failed:', error);
        }
    }

    testAuth();
})(); 