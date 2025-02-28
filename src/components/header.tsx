import Link from 'next/link';
import { FaDumbbell } from 'react-icons/fa6';
import Menu from './menu';

const links = [
  { path: '/workouts', text: 'Home' },
  // { path: '/workouts', text: 'Entrenos' },
  { path: '/templates', text: 'Plantillas' },
  { path: '/templates/new', text: 'Crear plantilla' },
  { path: '/exercises', text: 'Ejercicios' },
  { path: '/logs', text: 'Registros' },
];

const prodLinks = [
  { path: '/workouts', text: 'Home' },
  // { path: '/workouts', text: 'Entrenos' },
  { path: '/exercises', text: 'Ejercicios' },
  { path: '/logs', text: 'Registros' },
];

const Header = () => {
  return (
    <header className="py-2 border-b-fuchsia-600 border-b-[2px] fixed top-0 left-0 right-0 bg-black">
      <div className="mx-auto max-w-screen-xl flex md:justify-between max-md:justify-center px-5">
        <Link href={'/'} className="flex gap-2 items-center">
          <FaDumbbell className="text-2xl font-bold text-fuchsia-600" />
          <h1 className="text-xl font-bold">Bubs Trainer App</h1>
        </Link>
        <nav className={'flex gap-2 max-md:hidden'}>
          <Link href={'/'} className="font-medium">
            Entrenos
          </Link>
          <Link href={'/workouts'} className="font-medium">
            Plantillas
          </Link>
        </nav>
        <div className="md:hidden">
          <Menu
            links={
              process.env.ENVIRONMENT === 'development' ? links : prodLinks
            }
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
