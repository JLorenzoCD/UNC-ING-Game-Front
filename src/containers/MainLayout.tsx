import { Outlet } from 'react-router';

function MainLayout() {
  return (
    <>
    <div style={{ backgroundColor: '#810A0C' }}>
      <header className="px-135">
        <img
          src="../public/logo/logo.png"
          alt="Logo de la aplicación"
        />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
    </>
  );
}

export default MainLayout;