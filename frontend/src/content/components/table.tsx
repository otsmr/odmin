import React, { useState } from 'react';

import "../../style/component/table.scss"
import moment from 'moment';

export default function Table (props: {
    className?: string,
    header?: string[],
    data: (string | JSX.Element)[][],
    maxRowsShown?: number,
    disabledRows?: boolean[] 
}) {

    const showNumbersInPaggination = 2;

    const [sortByRow, setSortByRow] = useState(-1);
    const [sortOrderAsc, setSortOrderAsc] = useState(true);
    const [filterBy, setFilterBy] = useState("");
    const [maxRowsShown] = useState(props.maxRowsShown || 10);
    const [activPage, setActivePage] = useState(1);

    const filteredData = props.data.filter(e => {
        let res = false;
        e.forEach(ee => {
            if (ee.toString().toLowerCase().indexOf(filterBy.toLowerCase()) > -1) res = true;
        });
        return res;
    })

    let pagesTotal = Array(Math.ceil(filteredData.length / maxRowsShown)).fill("").map((e, index) => index+1);

    let maxPages = pagesTotal.length -1;
    function isNumberShow (page: number) {
        let left = activPage - showNumbersInPaggination / 2;
        let right = activPage + showNumbersInPaggination / 2;
        if (right >= maxPages ) {
            left -= (right-maxPages);
            right -= (right-maxPages);
        }
        if (activPage <= 1) {
            left += (right-1);
            right += (right-1);
        }
        return left <= page && page <= right;
    }

    let pages: (string | number)[] = pagesTotal;

    if (pagesTotal.length > 6) {
        pages = [1];
        for (let i = 2;i<pagesTotal.length-1;i++) {
            
            if (!isNumberShow(i)) {
                if (i === 2) pages.push("...");
                if (i === pagesTotal.length-2) pages.push("...");
                continue;
            }
            pages.push(i);
        }
        if (pagesTotal.length > 1) {
            pages.push(pagesTotal.length-1);
        }
    }


    let data = filteredData.slice(((activPage-1) * maxRowsShown), ((activPage-1) * maxRowsShown) + maxRowsShown);

    if (sortByRow >= 0) {
        data = data.sort((a, b) => {
            let aa: (string | number) = a[sortByRow].toString();
            let bb: (string | number) = b[sortByRow].toString();

            if (aa.match(/[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9] [0-9][0-9]:[0-9][0-9]/g)) {
                aa = +moment(aa, "DD.MM.YYYY HH:mm");
                bb = +moment(bb, "DD.MM.YYYY HH:mm");
            }
            if (aa > bb) return (sortOrderAsc) ? 1 : 0;
            if (aa < bb) return (sortOrderAsc) ? 0 : 1;
            return -1;
        })
    }

    function startSearch (index: number) {
        if (index === sortByRow) setSortOrderAsc(!sortOrderAsc);
        else {
            setSortByRow(index)
        }
    }

    return (
        <div className="table-group">
            <table className={props.className}>
                <thead>
                    <tr>
                        {props.header?.map((title, index) => (
                            <th onClick={e => startSearch(index)} key={index}>
                                {title}
                                {(sortByRow === index) ? (
                                    <i className={"fas fa-arrow-" + ((sortOrderAsc) ? "down" : "up")}></i>
                                ) : null}
                            </th>
                        ))}
                        {/* Sotieren... */}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className={(props.disabledRows && props.disabledRows[index]) ? "disabled" : ""}> 
                            {row.map((dataset, index) => (
                                <td key={index} >{dataset}</td>
                            ))} 
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="actions">

                {(props.data.length > maxRowsShown) ? (
                    <div className="input-group">
                        <input className="input" placeholder={`Tabelle filtern`} value={filterBy} onChange={e => setFilterBy(e.target.value)} />
                        {(filteredData.length !== props.data.length) ? (
                            <span>{filteredData.length}/{props.data.length} werden angezeigt</span>
                        ) : null}
                    </div>
                ) : null}
                
                {(pages.length > 1) ? (
                    <div className="pagination">
                        <ul>
                            {(activPage > 1) ? (
                                <li onClick={e => setActivePage(activPage-1)}><i className="fas fa-angle-left"></i></li>
                            ): null}
                            {pages.map((page, index) => (
                                (typeof page === "string") ? (
                                    <li key={index} className="disabled">{page}</li>
                                ) : (
                                    <li key={index} className={(page === activPage) ? "aktiv" : ""} onClick={e => setActivePage(page)}>{page}</li>
                                )
                            ))}
                            {(activPage <= maxPages) ? (
                                <li onClick={e => setActivePage(activPage+1)}><i className="fas fa-angle-right"></i></li>
                            ) : null}
                        </ul>
                    </div>
                ) : null }
            </div>
        </div>
    )

}