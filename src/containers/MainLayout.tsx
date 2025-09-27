import { Outlet } from 'react-router'

import Container from '@/components/Container'

import logoGame from '@/assets/logo.png'

export default function MainLayout() {
	return (
		<>
			<header className='px-135'>
				<img src={logoGame} alt="AGATHA CHRISTIE'S - DEATH ON THE CARDS" />
			</header>
			<main>
				<Container className='pt-5'>
					<Outlet />
				</Container>
			</main>
		</>
	)
}