
import { Node as ProsemirrorNode } from 'prosemirror-model';

import { EditorUI } from "../../api/ui";
import { EditorServer } from "../../api/server";
import { WidgetProps } from '../../api/widgets/react';
import React, { ChangeEvent } from 'react';
import { DialogButtons } from '../../api/widgets/dialog-buttons';
import ReactDOM from 'react-dom';
import { XRef, xrefKey } from '../../api/xref';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { TextInput } from '../../api/widgets/text';
import { SelectInput } from '../../api/widgets/select';
import uniqBy from 'lodash.uniqby';

import './insert_xref-styles.css';
import { kQuartoXRefTypes } from '../../marks/xref/xref-completion';

export async function insertXref(
  ui: EditorUI,
  doc: ProsemirrorNode,
  server: EditorServer,
  onInsertXref: (xref: XRef) => void
) {
  const performInsert = await ui.dialogs.htmlDialog(
    'Insert Cross Reference',
    'Insert',
    (
      containerWidth: number,
      containerHeight: number,
      confirm: VoidFunction,
      cancel: VoidFunction,
      _showProgress: (message: string) => void,
      _hideProgress: VoidFunction,
    ) => {
      const kMaxHeight = 400;
      const kMaxWidth = 650;
      const kMaxHeightProportion = 0.9;
      const kdialogPaddingIncludingButtons = 70;

      const windowHeight = containerHeight;
      const windowWidth = containerWidth;

      const height = Math.min(kMaxHeight, windowHeight * kMaxHeightProportion - kdialogPaddingIncludingButtons);
      const width = Math.max(Math.min(kMaxWidth, windowWidth * 0.9), 550);

      const container = window.document.createElement('div');
      container.className = 'pm-default-theme';
      container.style.width = width + 'px';

      // Look up the document and initialize the state
      const docPath = ui.context.getDocumentPath() || "";

      // Read the xrefs
      const loadXRefs = async () => {
        return (await server.xref.quartoIndexForFile(docPath)).refs;
      };

      const onInsert = (xref: XRef) => {
        onInsertXref(xref);
        confirm();
      };

      // REnder the panel
      ReactDOM.render(
        <InsertXrefPanel
          height={height}
          width={width}
          onOk={onInsert}
          onCancel={cancel}
          doc={doc}
          ui={ui}
          loadXRefs={loadXRefs}
        />,
        container,
      );
      return container;
    },
    () => {
      // Focus
      // dealt with in the React Component itself
    },
    () => {
      // Validation
      // User has to select a citation, everything else we can use defaults
      return null;
    },
  );
}


interface InsertXrefPanelProps extends WidgetProps {
  ui: EditorUI;
  doc: ProsemirrorNode;
  height: number;
  width: number;
  loadXRefs: () => Promise<XRef[]>;
  onOk: (xref: XRef) => void;
  onCancel: () => void;
}


const xRefTypes = [
  {
    type: "All Types",
    prefix: ""
  },
  {
    type: "Section",
    prefix: "sec"
  },
  {
    type: "Figure",
    prefix: "fig"
  },
  {
    type: "Table",
    prefix: "tbl"
  },
  {
    type: "Equation",
    prefix: "eg"
  },
  {
    type: "Listing",
    prefix: "lst"
  },
  {
    type: "Theorem",
    prefix: "thm"
  },
  {
    type: "Lemma",
    prefix: "lem"
  },
  {
    type: "Corollary",
    prefix: "cor"
  },
  {
    type: "Proposition",
    prefix: "prp"
  },
  {
    type: "Conjecture",
    prefix: "cnj"
  },
  {
    type: "Definition",
    prefix: "def"
  },
  {
    type: "Example",
    prefix: "exm"
  },
  {
    type: "Exercise",
    prefix: "exr"
  },
];


export const InsertXrefPanel: React.FC<InsertXrefPanelProps> = props => {

  // State
  const [xrefs, setXrefs] = React.useState<XRef[]>();
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const [selectedType, setSelectedType] = React.useState<string>("");
  const [filterText, setFilterText] = React.useState<string>("");

  // References to key controls
  const textRef = React.useRef<HTMLInputElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const fixedList = React.useRef<FixedSizeList>(null);

  // Load the cross ref data when the dialog loads
  React.useEffect(() => {
    props.loadXRefs().then(values => {

      // Sort the data
      const sorted = values.sort((a, b) => {
        const typeOrder = a.type.localeCompare(b.type);
        if (typeOrder !== 0) {
          return typeOrder;
        } else {
          return a.id.localeCompare(b.id);
        }
      });

      // Ensure that the items are unique
      const unique = uniqBy(sorted, (xref => {
        return `${xref.type}-${xref.id}`;
      }));

      setXrefs(unique);
    });

    setTimeout(() => {
      textRef.current?.focus();
    });
  }, []);

  // The types
  const options = () => {
    if (!xrefs) {
      return [];
    }

    const xrefTypes = xRefTypes.filter(xrefType => {
      return xrefType.prefix === "" || xrefs.find(xref => {
        return xref.type === xrefType.prefix;
      });
    });

    return xrefTypes.map(xrefType => (
      <option key={xrefType.type} value={xrefType.type}>
        {props.ui.context.translateText(xrefType.type)}
      </option>
    ));
  };

  // Filter the xrefs (by type or matching user typed text)
  const filteredXrefs = () => {
    if (!xrefs) {
      return [];
    }

    let filtered = xrefs;

    if (selectedType) {
      filtered = filtered.filter(xref => xref.type === selectedType);
    }

    if (filterText) {
      filtered = filtered.filter(xref => `${xref.id}-${xref.type}`.match(filterText) || xref.title?.match(filterText));
    }

    return filtered;
  };

  // Ensure that selection stays within the filtered range
  const displayXrefs = filteredXrefs();

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event?.target.value);
  };


  const currentIndex = Math.min(selectedIndex, displayXrefs.length - 1);

  const incrementIndex = (increment: number) => {
    let newIndex = currentIndex;
    if (increment > 0) {
      newIndex = Math.min(currentIndex + increment, displayXrefs.length - 1);
    } else {
      newIndex = Math.max(currentIndex + increment, 0);
    }
    if (newIndex !== currentIndex) {
      setSelectedIndex(newIndex);
      fixedList.current?.scrollToItem(newIndex);
    }
  };

  const kPageSize = 5;
  const handleKeyboardEvent = (event: React.KeyboardEvent<HTMLElement>) => {
    // Global Key Handling
    switch (event.key) {
      case 'ArrowUp':
        incrementIndex(-1);
        event.preventDefault();
        break;
      case 'ArrowDown':
        incrementIndex(1);
        event.preventDefault();
        break;
      case 'PageUp':
        incrementIndex(-kPageSize);
        event.preventDefault();
        break;
      case 'PageDown':
        incrementIndex(kPageSize);
        event.preventDefault();
        break;
      case 'Enter':
        acceptSelected();
        event.preventDefault();
      case 'Esc':
        props.onCancel();
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  // Handle the updating type selection
  const handleSelectChanged = (event: ChangeEvent<Element>) => {
    const value: string = (event.target as HTMLSelectElement).selectedOptions[0].value;
    const xrefType = xRefTypes.find(xType => xType.type === value);
    setSelectedType(xrefType?.prefix || "");
  };

  const handleItemClicked = (index: number) => {
    setSelectedIndex(index);
  };

  const placeholderText = xrefs === undefined ? "Loading Cross References" : "No Cross References Found.";

  const acceptSelected = () => {
    props.onOk(displayXrefs[currentIndex]);
  };

  // TODO: debounce text input?
  // TODO: Search via fuse
  // TODO: Actually insert the xref
  // TODO: keyboard handling for list

  return (
    <div className="pm-insert-xref">
      <div className="pm-insert-xref-search-container">
        <TextInput
          onKeyDown={handleKeyboardEvent}
          width={20 + 'ch'}
          iconAdornment={props.ui.images.search}
          tabIndex={0}
          className="pm-insert-xref-search-textbox"
          placeholder={props.ui.context.translateText("Search for Cross Reference")}
          onChange={handleTextChange}
          ref={textRef}
        />
        <SelectInput
          tabIndex={0}
          ref={selectRef}
          className="pm-insert-xref-select-type"
          onChange={handleSelectChanged}
        >
          {options()}
        </SelectInput>
      </div>

      <div className="pm-insert-xref-list-container">
        {xrefs && xrefs.length > 0 ? (
          <div
            onKeyDown={handleKeyboardEvent}
            tabIndex={0}
          >

            <FixedSizeList
              className="pm-insert-xref-list pm-block-border-color pm-background-color"
              height={props.height}
              width="100%"
              itemCount={displayXrefs.length}
              itemSize={60}
              itemData={{
                xrefs: displayXrefs,
                selectedIndex: currentIndex,
                ui: props.ui,
                onclick: handleItemClicked,
              }}
              ref={fixedList}
            >
              {XRefItem}
            </FixedSizeList>
          </div>

        ) : (
            <div
              className="pm-insert-xref-list-loading pm-block-border-color pm-background-color"
              style={{ width: "100%", height: props.height + "px" }}
            >
              <div>{placeholderText}</div>
            </div>
          )}

      </div>
      <div>
        <DialogButtons
          okLabel={props.ui.context.translateText('Insert')}
          cancelLabel={props.ui.context.translateText('Cancel')}
          onOk={acceptSelected}
          onCancel={props.onCancel}
        />

      </div>
    </div>


  );
};

interface XRefItemProps extends ListChildComponentProps {
  data: {
    xrefs: XRef[],
    selectedIndex: number
    ui: EditorUI,
    onclick: (index: number) => void
  };
}

const XRefItem = (props: XRefItemProps) => {
  const thisXref: XRef = props.data.xrefs[props.index];

  // The type (e.g. fig)
  const type = kQuartoXRefTypes[thisXref.type];

  // The id (e.g. fig-foobar)
  const id = xrefKey(thisXref, "quarto");

  // The display text for the entry
  const primaryText = `@${id}`;
  const secondaryText = thisXref.file;
  const detailText = thisXref.title || "";

  // The image and adornment
  const image = type?.image(props.data.ui) || props.data.ui.images.omni_insert?.generic!;

  // Click handler
  const onItemClick = () => {
    props.data.onclick(props.index);
  };

  // Whether this node is selected
  const selected = props.data.selectedIndex === props.index;
  const selectedClassName = `pm-xref-item${selected ? ' pm-list-item-selected' : ''}`;
  return (
    <div key={thisXref.id} style={props.style} className={selectedClassName} onClick={onItemClick}>
      <div className="pm-xref-item-image-container">
        <img src={image} className={'pm-xref-item-image pm-border-color'} />
      </div>
      <div className={'pm-xref-item-body pm-text-color'}>
        <div className="pm-xref-item-title">
          <div className="pm-xref-item-primary pm-fixedwidth-font">{primaryText}</div>
          <div className="pm-xref-item-secondary">{secondaryText}</div>
        </div>
        <div>
          <div className="pm-xref-item-detail">{detailText}</div>
        </div>
      </div>
    </div>
  );
};