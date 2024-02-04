import './styles.css';
import React, { useEffect, useState } from 'react';
import { Label, LoadingSpinner, SelectMenu, MenuItem } from '@qualtrics/ui-react';

export default function DataConfigurationPanel({
	client,
	configuration
}) {
	const [definition, setDefinition] = useState();

	useEffect(() => {
		let canceled = false;
		if (!definition) {
			(async () => {
				const { fieldsetDefinition } = await client.postMessage('getDataSourceDefinition');
				if (canceled) {
					return;
				}
				setDefinition(fieldsetDefinition);
			})();
		}
		return () => {
			canceled = true;
		};
	}, []);

	if (!definition) {
		return (
			<LoadingSpinner
				show
				size="medium"
				className='spinner'
			/>
		);
	}

	const column = configuration?.columns?.[0] ?? null;

	return (
		<FieldSelectMenu
			client={client}
			label={client.getText('configurationPanel.column')}
			defaultValue={column?.field}
			fields={getFieldsOfType(
				'ScalarValue',
				'EnumerableScalarValue'
			)}
			placement='top-start'
			onChange={onColumnChange}
		/>
	);

	function onColumnChange(field) {
		change((configuration) => ({
			...configuration,
			columns: [{
				id: field.fieldId,
				label: field.name,
				field: field.fieldId
			}],
			offset: 0,
			limit: 10
		}));
	}

	function change(map) {
		const newConfiguration = {
			...map(configuration),
			component: 'fieldsets-records',
			fieldsetId: definition.fieldSetId
		};
		newConfiguration.isComplete = !!newConfiguration.columns;
		client.postMessage('onDataConfigurationChange', newConfiguration);
	}

	function getFieldsOfType(...types) {
		return definition
			.fieldSetView
			.filter((field) => types.includes(field.type));
	}
}

function FieldSelectMenu({
	client,
	defaultValue,
	fields,
	label,
	onChange,
	placement
}) {
	return (
		<div className='form-group'>
			<Label className='label'>{label}</Label>
			<SelectMenu
				defaultValue={defaultValue}
				defaultLabel={client.getText('configurationPanel.selectAField')}
				placement={placement}
				maxHeight='100px'
				disabled={fields.length === 0}
				onChange={(fieldId) => {
					onChange(fields.find((field) => field.fieldId === fieldId));
				}}
			>
				{fields.map(({ fieldId, name }) =>
					<MenuItem
						key={fieldId}
						className='menu-item'
						value={fieldId}
					>
						{name}
					</MenuItem>
				)}
			</SelectMenu>
		</div>
	);
}
