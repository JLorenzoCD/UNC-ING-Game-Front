import { useState, type ChangeEvent } from 'react'

import { Link } from 'react-router'
import Button from '@/components/Button'
import Input from '@/components/Input'

import { FRONTEND_PATHS } from '@/constants/frontendPaths'

interface MatchForm {
	name: string
	min_players: number
	max_players: number
}

const initialStateMatchForm = {
	name: '',
	min_players: 2,
	max_players: 6,
}

function CreateMachPage() {
	const [formData, setFormData] = useState<MatchForm>(initialStateMatchForm)

	// const navigate = useNavigate()

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!formData.name || formData.max_players < formData.min_players) return

		// Se envía la info al backend
		console.log('Se envía la data')

		// Si todo es ok, se notifica al jugador y se redirecciona a el lobby
		// const res = { id: crypto.randomUUID() }
		// navigate(`${FRONTEND_PATHS.MATCH_LOBBY}/${res.id}`)
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const name = e.target.name

		if (name === 'name') {
			setFormData((prev) => ({ ...prev, [name]: e.target.value }))
			return
		}

		// Se asume que el valor es un numero del campo min_players o max_players
		const value = parseInt(e.target.value)

		if (
			!e.target.value ||
			value < 2 ||
			value > 6 ||
			(name === 'min_players' && value > formData.max_players) ||
			(name === 'max_players' && value < formData.min_players)
		) {
			/*
            - Si el usuario borra, es invalido
            - Si el valor es menor a 2 o mayor a 6, es invalido
            - Si el mínimo es mayor al máximo, es invalido
            - Si el máximo es menor al mínimo, es invalido
            */
			return
		}

		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	return (
		<>
			<Link to={FRONTEND_PATHS.HOME} className='ml-5'>
				<Button className='block mx-auto w-60 my-5'>List of matches</Button>
			</Link>
			<form onSubmit={handleSubmit} className='bg-white rounded-xl p-6 max-w-3xl mx-auto'>
				<h1 className='text-center text-4xl font-bold'>Create match</h1>
				<hr className='my-2' />
				<section className='mb-5'>
					<label className='block my-5 font-medium'>
						Name of the match <span className='text-amber-600'>*</span>
						<Input
							value={formData.name}
							onChange={handleChange}
							name='name'
							type='text'
							placeholder='The best room on the server'
							required
						/>
					</label>
					<div className='grid sm:grid-cols-2 sm:gap-6'>
						<label className='block mb-2 font-medium'>
							Minimum number of desired players
							<Input
								value={formData.min_players}
								onChange={handleChange}
								name='min_players'
								type='number'
								min={2}
								max={6}
								placeholder='default 2'
							/>
						</label>
						<label className='block mb-2 font-medium'>
							Maximum number of desired players
							<Input
								value={formData.max_players}
								onChange={handleChange}
								name='max_players'
								type='number'
								min={2}
								max={6}
								placeholder='default 6'
							/>
						</label>
					</div>
				</section>
				{!!formData.name && (
					<>
						<hr className='my-2' />
						<section className='mb-5'>
							<p>Match name: {formData.name}</p>
							<p>
								Players: {formData.min_players}/{formData.max_players}
							</p>
						</section>
					</>
				)}
				<Button type='submit' className='block w-xl mx-auto'>
					Create match
				</Button>
			</form>
		</>
	)
}

export default CreateMachPage
