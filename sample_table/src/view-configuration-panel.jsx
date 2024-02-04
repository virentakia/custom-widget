import React, { useEffect, useState } from 'react';
import { Label, SelectMenu, MenuItem } from '@qualtrics/ui-react';

const tableTypes = [{
	label: 'Paginated',
	key: 'paginated',
}, {
	label: 'Infinite Scroll',
	key: 'scroll'
}];

export default function ViewConfigurationPanel({
	client,
	data,
	configuration
}) {
	const [tableType, setTableType] = useState(configuration?.tableType || 'paginated');

	useEffect(() => {
		change({
			tableType: tableType
		})
	}, [tableType]);

	return (
		<div className='form-group'>
			<Label className='label'>{client.getText('configurationPanel.tableType')}</Label>
			<SelectMenu
				defaultValue={tableType}
				onChange={(type) => {
					setTableType(type);
				}}
			>
				{tableTypes.map(({ label, key }) =>
					<MenuItem key={key} value={key}>{label}</MenuItem>
				)}
			</SelectMenu>
		</div>
	);

	function change(configuration) {
		client.postMessage('onViewConfigurationChange', configuration);
	}
}
