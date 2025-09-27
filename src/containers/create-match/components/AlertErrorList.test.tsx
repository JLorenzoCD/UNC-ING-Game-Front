import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import AlertErrorList from './AlertErrorList'

describe('AlertErrorList', () => {
	it('should render the component with a title and a list of errors', () => {
		const props = {
			title: 'Validation Errors:',
			errorList: [
				{ key: 0, error: 'Error in field 1.' },
				{ key: 1, error: 'Error in field 2.' },
			],
		}

		render(<AlertErrorList {...props} />)

		expect(screen.getByText(props.title)).toBeInTheDocument()

		const errorItems = screen.getAllByTestId('error-item')
		expect(errorItems).toHaveLength(props.errorList.length)

		props.errorList.forEach(({ error }) => {
			expect(screen.getByText(error)).toBeInTheDocument()
		})
	})

	it('should not render if the title is empty', () => {
		const props = {
			title: '',
			errorList: [{ key: 1, error: 'Error in field 1.' }],
		}

		const { container } = render(<AlertErrorList {...props} />)

		// No debería de mostrar nada
		expect(container).toBeEmptyDOMElement()
	})

	it('should not render if the error list is empty or contains only empty errors', () => {
		const propsWithEmptyList = {
			title: 'Validation Errors',
			errorList: [],
		}

		const propsWithEmptyErrors = {
			title: 'Validation Errors',
			errorList: [{ key: 1, error: '' }],
		}

		// Si se pasa una lista de errores vacía no se debería de mostrar nada
		const { container: containerEmptyList } = render(<AlertErrorList {...propsWithEmptyList} />)
		expect(containerEmptyList).toBeEmptyDOMElement()

		// Si se pasa una lista de errores con los valores de estos vacíos, no se debería de mostrar nada
		const { container: containerEmptyErrors } = render(<AlertErrorList {...propsWithEmptyErrors} />)
		expect(containerEmptyErrors).toBeEmptyDOMElement()
	})

	it('should render a single error correctly', () => {
		const errorText = 'Error in field 1.'

		const props = {
			title: 'Validation Error',
			errorList: [{ key: 1, error: errorText }],
		}

		render(<AlertErrorList {...props} />)

		expect(screen.getByText(props.title)).toBeInTheDocument()

		const errorItems = screen.getAllByTestId('error-item')
		expect(errorItems).toHaveLength(1)

		expect(screen.getByText(errorText)).toBeInTheDocument()
	})

	it('should only render errors that are not empty', () => {
		const props = {
			title: 'Validation Error',
			errorList: [
				{ key: 0, error: 'Error in field 1.' },
				{ key: 1, error: '' },
				{ key: 2, error: 'Error in field 3.' },
			],
		}

		render(<AlertErrorList {...props} />)

		expect(screen.getByText(props.title)).toBeInTheDocument()

		const errorItems = screen.getAllByTestId('error-item')
		expect(errorItems).toHaveLength(props.errorList.length - 1) // 1 error vació

		props.errorList.forEach(({ error }) => {
			if (error) {
				expect(screen.getByText(error)).toBeInTheDocument()
			}
		})
	})
})
