import type { ButtonHTMLAttributes } from 'react'

function Button({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`${className} focus:outline-none text-white bg-[#2C2C2C] hover:bg-[#4D4D4D] focus:ring-4 focus:ring-[#4D4D4D] font-medium rounded-lg text-sm px-5 py-2.5`}
			{...rest}
		/>
	)
}

export default Button
