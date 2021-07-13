import { setColumnText } from "../generalFunctions";

export default function getDocDefinition(
  printParams: any,
  agGridApi: any,
  agGridColumnApi: any
) {
  const {
    PDF_HEADER_COLOR,
    PDF_INNER_BORDER_COLOR,
    PDF_OUTER_BORDER_COLOR,
    PDF_ODD_BKG_COLOR,
    PDF_EVEN_BKG_COLOR,
    PDF_HEADER_HEIGHT,
    PDF_ROW_HEIGHT,
    PDF_PAGE_ORITENTATION,
    PDF_WITH_CELL_FORMATTING,
    PDF_WITH_COLUMNS_AS_LINKS,
    PDF_SELECTED_ROWS_ONLY,
    PDF_WITH_FOOTER_PAGE_COUNT,
    PDF_LOGO,
  } = printParams;

  return (function () {
    const columnGroupsToExport = getColumnGroupsToExport();

    const columnsToExport = getColumnsToExport();

    const widths = getExportedColumnsWidths(columnsToExport);

    const rowsToExport = getRowsToExport(columnsToExport);

    const body = columnGroupsToExport
      ? [columnGroupsToExport, columnsToExport, ...rowsToExport]
      : [columnsToExport, ...rowsToExport];

    const headerRows = columnGroupsToExport ? 2 : 1;

    // const header = PDF_WITH_HEADER_IMAGE
    //   ? {
    //       image: "ag-grid-logo",
    //       width: 150,
    //       alignment: "center",
    //       margin: [0, 10, 0, 10],
    //     }
    //   : null;

    const footer = PDF_WITH_FOOTER_PAGE_COUNT
      ? function (currentPage: any, pageCount: any) {
          return {
            text: currentPage.toString() + " of " + pageCount,
            margin: [20],
          };
        }
      : null;

    // const pageMargins = [
    //   10,
    //   PDF_WITH_HEADER_IMAGE ? 70 : 20,
    //   10,
    //   PDF_WITH_FOOTER_PAGE_COUNT ? 40 : 10,
    // ];
    const pageMargins = [10, 70, 10, 40];

    const heights = (rowIndex: any) =>
      rowIndex < headerRows ? PDF_HEADER_HEIGHT : PDF_ROW_HEIGHT;

    const fillColor = (rowIndex: any, node: any, columnIndex: any) => {
      if (rowIndex < node.table.headerRows) {
        return PDF_HEADER_COLOR;
      }
      return rowIndex % 2 === 0 ? PDF_ODD_BKG_COLOR : PDF_EVEN_BKG_COLOR;
    };

    const hLineWidth = (i: any, node: any) =>
      i === 0 || i === node.table.body.length ? 1 : 1;

    const vLineWidth = (i: any, node: any) =>
      i === 0 || i === node.table.widths.length ? 1 : 0;

    const hLineColor = (i: any, node: any) =>
      i === 0 || i === node.table.body.length
        ? PDF_OUTER_BORDER_COLOR
        : PDF_INNER_BORDER_COLOR;

    const vLineColor = (i: any, node: any) =>
      i === 0 || i === node.table.widths.length
        ? PDF_OUTER_BORDER_COLOR
        : PDF_INNER_BORDER_COLOR;

    const docDefintiion = {
      pageOrientation: PDF_PAGE_ORITENTATION,
      header: {
        image: PDF_LOGO,
        width: 100,
        alignment: "center",
        margin: [0, 10, 0, 10],
      },
      footer,
      content: [
        {
          style: "myTable",
          table: {
            headerRows,
            widths,
            body,
            heights,
          },
          layout: {
            fillColor,
            hLineWidth,
            vLineWidth,
            hLineColor,
            vLineColor,
          },
        },
      ],
      styles: {
        myTable: {
          margin: [0, 0, 0, 0],
        },
        tableHeader: {
          bold: true,
          margin: [0, PDF_HEADER_HEIGHT / 3, 0, 0],
        },
        tableCell: {
          // margin: [0, 15, 0, 0]
        },
      },
      pageMargins,
    };

    return docDefintiion;
  })();

  function getColumnGroupsToExport() {
    let displayedColumnGroups = agGridColumnApi.getAllDisplayedColumnGroups();

    let isColumnGrouping = displayedColumnGroups.some((col: any) =>
      col.hasOwnProperty("children")
    );

    if (!isColumnGrouping) {
      return null;
    }

    let columnGroupsToExport: any = [];

    displayedColumnGroups.forEach((colGroup: any) => {
      let isColSpanning = colGroup.children.length > 1;
      let numberOfEmptyHeaderCellsToAdd = 0;

      if (isColSpanning) {
        let headerCell = createHeaderCell(colGroup);
        columnGroupsToExport.push(headerCell);
        // subtract 1 as the column group counts as a header
        numberOfEmptyHeaderCellsToAdd--;
      }

      // add an empty header cell now for every column being spanned
      colGroup.displayedChildren.forEach((childCol: any) => {
        let pdfExportOptions = getPdfExportOptions(childCol.getColId());
        if (!pdfExportOptions || !pdfExportOptions.skipColumn) {
          numberOfEmptyHeaderCellsToAdd++;
        }
      });

      for (let i = 0; i < numberOfEmptyHeaderCellsToAdd; i++) {
        columnGroupsToExport.push({});
      }
    });

    return columnGroupsToExport;
  }

  function getColumnsToExport() {
    let columnsToExport: any = [];

    agGridColumnApi.getAllDisplayedColumns().forEach((col: any) => {
      let pdfExportOptions = getPdfExportOptions(col.getColId());
      if (pdfExportOptions && pdfExportOptions.skipColumn) {
        return;
      }
      let headerCell = createHeaderCell(col);
      columnsToExport.push(headerCell);
    });

    return columnsToExport;
  }

  function getRowsToExport(columnsToExport: any) {
    let rowsToExport: any = [];

    agGridApi.forEachNodeAfterFilterAndSort((node: any) => {
      if (PDF_SELECTED_ROWS_ONLY && !node.isSelected()) {
        return;
      }
      let rowToExport = columnsToExport.map(({ colId }: any) => {
        let cellValue = agGridApi.getValue(colId, node);
        let tableCell = createTableCell(cellValue, colId);
        return tableCell;
      });
      rowsToExport.push(rowToExport);
    });

    return rowsToExport;
  }

  function getExportedColumnsWidths(columnsToExport: any) {
    return columnsToExport.map(() => 100 / columnsToExport.length + "%");
  }

  function createHeaderCell(col: any) {
    let headerCell = { text: "", colSpan: "", colId: "", style: "" };

    let isColGroup = col.hasOwnProperty("children");

    if (isColGroup) {
      headerCell.text = col.originalColumnGroup.colGroupDef.headerName;
      headerCell.colSpan = col.children.length;
      headerCell.colId = col.groupId;
    } else {
      let headerName = setColumnText(col.colDef.field);

      if (col.sort) {
        headerName += ` (${col.sort})`;
      }
      if (col.filterActive) {
        headerName += ` [FILTERING]`;
      }

      headerCell.text = headerName;
      headerCell.colId = col.getColId();
    }

    headerCell["style"] = "tableHeader";

    return headerCell;
  }

  function createTableCell(cellValue: any, colId: any) {
    const tableCell = {
      text: cellValue !== undefined ? cellValue : "",
      style: "tableCell",
      link: "",
      color: "",
      decoration: "",
    };

    const pdfExportOptions = getPdfExportOptions(colId);

    if (pdfExportOptions) {
      const { styles, createURL } = pdfExportOptions;

      if (PDF_WITH_CELL_FORMATTING && styles) {
        Object.entries(styles).forEach(
          /* @ts-ignore */
          ([key, value]) => (tableCell[key] = value)
        );
      }

      if (PDF_WITH_COLUMNS_AS_LINKS && createURL) {
        tableCell["link"] = createURL(cellValue);
        tableCell["color"] = "blue";
        tableCell["decoration"] = "underline";
      }
    }

    return tableCell;
  }

  function getPdfExportOptions(colId: any) {
    let col = agGridColumnApi.getColumn(colId);
    return col.colDef.pdfExportOptions;
  }
}
