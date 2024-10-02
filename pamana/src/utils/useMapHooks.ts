import { useDispatch } from "react-redux"
import { updateViewState } from "../store/viewStateSlice";
import debounce from "../utils/debounce";

export const useMapHooks = () => {
  const dispatch = useDispatch();

  const handleViewStateChange = ({ viewState }: { viewState: any }) => {
    dispatch(updateViewState(viewState));
  }

  const debouncedHandleViewStateChange = debounce(handleViewStateChange, 200);

  return { handleViewStateChange, debouncedHandleViewStateChange };
}