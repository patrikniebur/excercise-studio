import React from "react";
import { useDrag, useDrop } from "react-dnd";

export type Render<TItem extends ItemWithId> = (
  item: TItem,
  ref: React.Ref<any>,
  childProps: ChildProps,
) => React.ReactNode;

export type ItemWithId = { id: string | number };

type ChildProps = {
  isDragging?: boolean;
};

type Props<TItem extends ItemWithId> = {
  render: Render<TItem>;
  item: TItem;
  onChangeOrder: (myIndex: ItemWithId["id"], newIndex: ItemWithId["id"]) => void;
};

const ITEM_TYPE = "SORTABLE_ITEM";

export function SortableItem<TItem extends ItemWithId>({
  render,
  item,
  onChangeOrder,
}: Props<TItem>) {
  const ref = React.useRef();

  const [_, drop] = useDrop<TItem>({
    accept: ITEM_TYPE,
    hover: (target) => {
      if (target.id !== item.id) {
        onChangeOrder(target.id, item.id);
      }
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return item;
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));

  return render(item, ref, { isDragging });
}
