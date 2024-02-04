import './styles.css';
import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Pagination } from '@qualtrics/ui-react';
import React, { useState, useEffect } from 'react';
import WithClient from './with-client';
import render from './render';

const PAGE_SIZE = 10;
const SCROLL_TABLE_TYPE = 'scroll';
const PAGINATED_TABLE_TYPE = 'paginated';

function Visualization() {
	return (
		<WithClient>
			{(props) =>
				<Content
					// Force re-mount when chart type has changed
					{...props}
					key={props.viewConfiguration.tableType + props.data?.columns[0].id}
				/>
			}
		</WithClient>
	);
}

function Content({ data, viewConfiguration, client }) {
	const { id: columnId, label: columnLabel } = data.columns[0];
	const { tableType } = viewConfiguration;
	const maxData = data.meta.recordCount;

	const [currentPage, setCurrentPage] = React.useState(1);
	const [totalData, setTotalData] = useState([]);
	const [currentData, setCurrentData] = useState([]);

	useEffect(() => {
		const newData = [...totalData];
		const rowValues = data?.rows?.map((row) => row.values[columnId].value);
		newData[currentPage - 1] = rowValues;
		setTotalData(newData);
		setCurrentData(getTableData(newData));
	}, [data]);

	useEffect(() => {
		if (!totalData[currentPage - 1]) {
			getNewPage(currentPage)
		} else {
			setCurrentData(getTableData(totalData));
		}
	}, [currentPage])

	return (
		<div className='visualization' onScroll={handleScroll}>
			<Table>
				<TableHead>
					<TableRow>
						<TableHeaderCell>{columnLabel}</TableHeaderCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{
						currentData.map((data, index) =>
							<TableRow key={index}>
								<TableCell>{data}</TableCell>
							</TableRow>
						)
					}
				</TableBody>
			</Table>
			{tableType === PAGINATED_TABLE_TYPE ?
				<Pagination
					data-testid="MyPagination"
					numPages={maxData / PAGE_SIZE}
					currentPage={currentPage}
					onPageChange={({ page }) => setCurrentPage(page)}
					aria-label="Pagination with max pages"
				/> : null
			}
		</div>
	)

	function getNewPage(page) {
		const changeObj = {
			type: 'get-page',
			pagination: {
				offset: (page - 1) * PAGE_SIZE,
				limit: PAGE_SIZE
			}
		}
		client.postMessage('changeData', changeObj);
	}

	function handleScroll(event) {
		if(tableType !== SCROLL_TABLE_TYPE) {
			return;
		}

		const offset = 0;
		const targetElement = event.currentTarget;
		const distanceToScrollEnd = targetElement.scrollHeight - targetElement.scrollTop;
		const scrollEndThreshold = targetElement.clientHeight + offset;
		if (distanceToScrollEnd <= scrollEndThreshold) {
			setCurrentPage(currentPage + 1)
		}
		return;
	}

	function getTableData(data) {
		if (tableType === PAGINATED_TABLE_TYPE) {
			return data[currentPage - 1];
		}

		if (tableType === SCROLL_TABLE_TYPE) {
			return data.flat();
		}

		return [];
	}
}

render(Visualization);
