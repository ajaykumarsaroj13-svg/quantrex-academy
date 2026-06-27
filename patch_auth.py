import re

with open('src/pages/Auth.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

intercept_logic = """  const handleSubmit = async (e) => {
    e.preventDefault();

    // HARDCODED ADMIN OVERRIDE
    if (email === 'qauntrexacademy@gmail.com' && password === 'function13@') {
      const adminData = {
        id: 'admin_super',
        name: 'Super Admin',
        email: 'qauntrexacademy@gmail.com',
        role: 'admin',
        sessions: []
      };
      onLoginSuccess('super_admin_token', adminData);
      setActivePage('admin-dashboard');
      return;
    }

    setLoading(true);"""

content = content.replace("  const handleSubmit = async (e) => {\n    e.preventDefault();\n    setLoading(true);", intercept_logic)

with open('src/pages/Auth.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
