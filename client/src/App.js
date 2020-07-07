import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CallUsers from './components/callUser.js';

function App() {
	const [name, setName] = useState('');
	const [data, setData] = useState('');

	var handleSubmit = () => {
		var data = <CallUsers username={name} />;
		setData(data);
	};
	return (
		<div>
			<TextField
				id='standard-basic'
				label='Enter You Name'
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
			<Button onClick={() => handleSubmit()}>Enter</Button>

			{data}
		</div>
	);
}
export default App;
