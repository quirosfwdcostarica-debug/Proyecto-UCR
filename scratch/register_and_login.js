// scratch/register_and_login.js
// Node >=18 has fetch built‑in
const apiBase = 'http://localhost:3001/api';
async function registerStudent() {
  const res = await fetch(`${apiBase}/auth/register/student`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teststudent@ucr.ac.cr',
      nombre: 'Test Student',
      password: 'Password1',
      cedula: '12345678',
      fecha_nacimiento: '2000-01-01',
      genero: 'M'
    })
  });
  const data = await res.json();
  console.log('Register status:', res.status);
  console.log(data);
  return data;
}
async function login() {
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teststudent@ucr.ac.cr', password: 'Password1' })
  });
  const data = await res.json();
  console.log('Login status:', res.status);
  console.log(data);
}
(async () => {
  await registerStudent();
  await login();
})();
