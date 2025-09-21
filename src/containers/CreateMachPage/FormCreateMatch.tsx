import Button from '@/components/Button'
import Input from '@/components/Input'

import type { Match } from '@/types/match'
import type { MatchToCreate } from './type'
import useFormCreateMatch from './useFormCreateMatch'

interface Props {
	handleCreateMatch: (matchToCreate: MatchToCreate) => Promise<Match>
}

function FormCreateMatch({ handleCreateMatch }: Props) {
	const { formData, handleChange, formError, haveError, createHandleSubmit, loading } = useFormCreateMatch()

	return (
		<form onSubmit={createHandleSubmit(handleCreateMatch)} className='bg-white rounded-xl p-6 max-w-3xl mx-auto'>
			<h1 className='text-center text-4xl font-bold'>Create match</h1>
			<hr className='my-2' />
			<section className='mb-5'>
				{haveError && (
					<span className='block bg-red-400 text-white font-bold p-2 mb-2'>
						Error:{' '}
						{Object.values(formError).map((err, index) => (
							<p key={index}>{err}</p>
						))}
					</span>
				)}
				<label className='block my-5 font-medium'>
					<span className={formError.name ? 'text-rose-600' : ''}>Name of the match</span>{' '}
					<span className='text-amber-600'>*</span>
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
						<span className={formError.min_players ? 'text-rose-600' : ''}>Minimum number of desired players</span>
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
						<span className={formError.max_players ? 'text-rose-600' : ''}>Maximum number of desired players</span>
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
			<Button type='submit' className='block w-xl mx-auto' disabled={!!haveError}>
				{loading ? 'loading...' : 'Create match'}
			</Button>
		</form>
	)
}

export default FormCreateMatch
