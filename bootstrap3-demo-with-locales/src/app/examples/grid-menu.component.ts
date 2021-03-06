import { Component, Injectable, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularGridInstance, Column, ExtensionName, FieldType, Filters, Formatters, GridOption } from 'angular-slickgrid';

@Component({
  templateUrl: './grid-menu.component.html',
  styleUrls: ['./grid-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
@Injectable()
export class GridMenuComponent implements OnInit {
  title = 'Example 9: Grid Menu Control';
  subTitle = `
    This example demonstrates using the <b>Slick.Controls.GridMenu</b> plugin to easily add a Grid Menu (aka hamburger menu) on the top right corner of the grid.
    (<a href="https://github.com/ghiscoding/Angular-Slickgrid/wiki/Grid-Menu" target="_blank">Wiki docs</a>)
    <br/>
    <ul>
      <li>You can change the Grid Menu icon, for example "fa-ellipsis-v"&nbsp;&nbsp;<span class="fa fa-ellipsis-v"></span>&nbsp;&nbsp;(which is shown in this example)</li>
      <li>By default the Grid Menu shows all columns which you can show/hide them</li>
      <li>You can configure multiple custom "commands" to show up in the Grid Menu and use the "onGridMenuCommand()" callback</li>
      <li>Doing a "right + click" over any column header will also provide a way to show/hide a column (via the Column Picker Plugin)</li>
      <li>You can change the icons of both picker via SASS variables as shown in this demo (check all SASS variables)</li>
      <li><i class="fa fa-arrow-down"></i> You can also show the Grid Menu anywhere on your page</li>
    </ul>
  `;

  angularGrid: AngularGridInstance;
  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];
  selectedLanguage: string;

  constructor() { }

  ngOnInit(): void {
    this.columnDefinitions = [
      { id: 'title', name: 'Title', field: 'title', filterable: true, type: FieldType.string },
      { id: 'duration', name: 'Duration', field: 'duration', sortable: true, filterable: true, type: FieldType.string },
      {
        id: 'percentComplete', name: '% Complete', field: 'percentComplete', sortable: true, filterable: true,
        type: FieldType.number,
        formatter: Formatters.percentCompleteBar,
        filter: { model: Filters.compoundSlider, params: { hideSliderNumber: false } }
      },
      { id: 'start', name: 'Start', field: 'start', filterable: true, type: FieldType.string },
      { id: 'finish', name: 'Finish', field: 'finish', filterable: true, type: FieldType.string },
      {
        id: 'effort-driven', name: 'Completed', field: 'effortDriven', maxWidth: 80, formatter: Formatters.checkmark,
        type: FieldType.boolean,
        minWidth: 100,
        sortable: true,
        filterable: true,
        filter: {
          collection: [{ value: '', label: '' }, { value: true, label: 'true' }, { value: false, label: 'false' }],
          model: Filters.singleSelect
        }
      }
    ];

    this.gridOptions = {
      columnPicker: {
        hideForceFitButton: true,
        hideSyncResizeButton: true,
        onColumnsChanged: (e, args) => {
          console.log('Column selection changed from Column Picker, visible columns: ', args.columns);
        }
      },
      enableAutoResize: true,
      enableGridMenu: true,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      enableFiltering: true,
      enableCellNavigation: true,
      gridMenu: {
        customTitle: 'Custom Commands',
        iconCssClass: 'fa fa-ellipsis-v', // defaults to "fa-bars"
        hideForceFitButton: true,
        hideSyncResizeButton: true,
        hideToggleFilterCommand: false, // show/hide internal custom commands
        menuWidth: 17,
        resizeOnShowHeaderRow: true,
        customItems: [
          // add Custom Items Commands which will be appended to the existing internal custom items
          // you cannot override an internal items but you can hide them and create your own
          // also note that the internal custom commands are in the positionOrder range of 50-60,
          // if you want yours at the bottom then start with 61, below 50 will make your command(s) show on top
          {
            iconCssClass: 'fa fa-question-circle',
            title: 'Help',
            disabled: false,
            command: 'help',
            positionOrder: 90,
            cssClass: 'bold',     // container css class
            textCssClass: 'blue'  // just the text css class
          },
          // you can pass divider as a string or an object with a boolean (if sorting by position, then use the object)
          // note you should use the "divider" string only when items array is already sorted and positionOrder are not specified
          { divider: true, command: '', positionOrder: 89 },
          // 'divider',
          {
            title: 'Command 1',
            command: 'command1',
            positionOrder: 91,
            cssClass: 'orange',
            iconCssClass: 'fa fa-warning',
            // you can use the "action" callback and/or use "onCallback" callback from the grid options, they both have the same arguments
            action: (e, args) => alert(args.command),
            itemUsabilityOverride: (args) => {
              // for example disable the command if there's any hidden column(s)
              if (args && Array.isArray(args.columns)) {
                return args.columns.length === args.visibleColumns.length;
              }
              return true;
            },
          },
          {
            title: 'Command 2',
            command: 'command2',
            positionOrder: 92,
            cssClass: 'red',        // container css class
            textCssClass: 'italic', // just the text css class
            action: (e, args) => alert(args.command),
            itemVisibilityOverride: (args) => {
              // for example hide this command from the menu if there's any filter entered
              if (this.angularGrid) {
                return this.isObjectEmpty(this.angularGrid.filterService.getColumnFilters());
              }
              return true;
            },
          },
          {
            title: 'Disabled command',
            disabled: true,
            command: 'disabled-command',
            positionOrder: 98
          }
        ],
        onCommand: (e, args) => {
          if (args.command === 'help') {
            alert('Please help!!!');
          }
        },
        onColumnsChanged: (e, args) => {
          console.log('Column selection changed from Grid Menu, visible columns: ', args.columns);
        }
      },
    };

    this.getData();
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
  }

  getData() {
    // Set up some test columns.
    const mockDataset = [];
    for (let i = 0; i < 500; i++) {
      mockDataset[i] = {
        id: i,
        title: 'Task ' + i,
        phone: this.generatePhoneNumber(),
        duration: Math.round(Math.random() * 25) + ' days',
        percentComplete: Math.round(Math.random() * 100),
        start: '01/01/2009',
        finish: '01/05/2009',
        effortDriven: (i % 5 === 0)
      };
    }
    this.dataset = mockDataset;
  }

  generatePhoneNumber() {
    let phone = '';
    for (let i = 0; i < 10; i++) {
      phone += Math.round(Math.random() * 9) + '';
    }
    return phone;
  }

  toggleGridMenu(e) {
    if (this.angularGrid && this.angularGrid.extensionService) {
      const gridMenuInstance = this.angularGrid.extensionService.getSlickgridAddonInstance(ExtensionName.gridMenu);
      gridMenuInstance.showGridMenu(e);
    }
  }

  private isObjectEmpty(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== '') {
        return false;
      }
    }
    return true;
  }
}
