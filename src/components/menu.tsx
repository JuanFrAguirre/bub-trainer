'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useCallback, useState } from 'react';
import { IoMenuSharp } from 'react-icons/io5';

interface Props {
  links: {
    text: string;
    path: string;
  }[];
}

export const MenuDesktop: FC<Props> = ({ links }) => {
  const path = usePathname();

  return (
    <nav className={'flex gap-2 max-md:hidden'}>
      {links.map((link) => (
        <Link
          href={link.path}
          className={clsx(
            `font-medium hover:text-fuchsia-600`,
            path === link.path && 'text-fuchsia-600',
          )}
          key={link.path}
        >
          {link.text}
        </Link>
      ))}
    </nav>
  );
};

export const Menu: FC<Props> = ({ links }) => {
  const [menuIsShown, setMenuIsShown] = useState(false);
  const path = usePathname();

  const toggleMenuIsShown = useCallback(() => {
    setMenuIsShown((prev) => !prev);
  }, []);

  return (
    <>
      <div
        className={clsx(
          'fixed bottom-0 top-0 left-0 right-0 backdrop-blur-sm bg-black/25',
          !menuIsShown && 'hidden',
        )}
        onClick={() => setMenuIsShown(false)}
      ></div>
      <div
        className={clsx(
          'secondary fixed right-6 bottom-24 rounded-md transition duration-300 transform',
          menuIsShown
            ? 'translate-x-0 translate-y-0'
            : 'translate-x-[150%] translate-y-10',
        )}
      >
        <nav className="flex flex-col w-full">
          {links.map((link) => (
            <Link
              key={link.text}
              className={clsx(
                'py-3 px-6 text-xl text-center border last:border-b-0 border-white first:rounded-t-md last:rounded-b-md',
                path === link.path
                  ? 'bg-black border-l-8 border-l-fuchsia-600 '
                  : 'bg-stone-900/85',
              )}
              href={link.path}
              onClick={() => setMenuIsShown(false)}
            >
              {link.text}
            </Link>
          ))}
        </nav>
      </div>
      <button
        className={clsx(
          'fixed bottom-12 right-6 overflow-hidden rounded-md border-2 border-fuchsia-600 p-0 px-1 !bg-black',
        )}
        onClick={toggleMenuIsShown}
      >
        <IoMenuSharp className="text-4xl" />
      </button>
    </>
  );
};
