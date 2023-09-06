import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { SortableItem, Render, ItemWithId } from "./SortableItem";

type Props<TItem extends ItemWithId> = {
  items: TItem[];
  render: Render<TItem>;
  onReorder: (reorderedItems: TItem[]) => void;
};

export function Sortable<TItem extends ItemWithId>({
  items,
  render,
  onReorder,
}: Props<TItem>) {
  const onChangeOrder = (
    sourceId: ItemWithId["id"],
    targetId: ItemWithId["id"],
  ) => {
    const currentIndex = items.findIndex(({ id }) => id === sourceId);
    const targetIndex = items.findIndex(({ id }) => id === targetId);
    const newArr = [...items];
    const [removedItem] = newArr.splice(currentIndex, 1);
    newArr.splice(targetIndex, 0, removedItem);

    return onReorder(newArr);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {items.map((item) => (
        <SortableItem
          key={item.id}
          render={render}
          item={item}
          onChangeOrder={onChangeOrder}
        />
      ))}
    </DndProvider>
  );
}
