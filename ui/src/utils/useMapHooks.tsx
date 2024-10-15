import { useDispatch } from "react-redux"
import { updateViewState } from "../store/viewStateSlice";
import debounce from "./debounce";
import { renderToStaticMarkup } from "react-dom/server";

export const useMapHooks = () => {
  const dispatch = useDispatch();
  let isHovering = false;

  const handleViewStateChange = ({ viewState }: { viewState: any }) => {
    dispatch(updateViewState(viewState));
  }

  const handleHover = ({ object }: any) => (isHovering = !!object);
  const handleCursor = ({ isDragging }: { isDragging: boolean }) =>
    isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';

  const handleTooltip = (info: any) => {
    // This is a very custom solution, to keep react working with the current deck.gl native tooltip, but other solutions could be done. Check tooltip documentation https://deck.gl/docs/api-reference/core/deck#gettooltip
    function createMarkup() {
      return { __html: info.object.html };
    }

    if (info?.object?.html) {
      return {
        /*
          This is a classic approach to set innerHtml.
          There are other options to consider though as https://deck.gl/docs/developer-guide/interactivity/#using-react
        */
        html: renderToStaticMarkup(
          <div dangerouslySetInnerHTML={createMarkup()}></div>
        ),
        style: info.object.style,
      };
    }
    return null;
  };

  const debouncedHandleViewStateChange = debounce(handleViewStateChange, 200);

  return {
    handleViewStateChange,
    handleHover,
    handleCursor,
    handleTooltip,
    debouncedHandleViewStateChange
  };
}