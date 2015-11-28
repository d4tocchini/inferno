import isEventSupported from './isEventSupported';
import capturableEvents from './capturableEvents';
import nonBubbleableEvents from './nonBubbleableEvents';
import focusEvents from './focusEvents';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import addRootDomEventListeners from './addRootDomEventListeners';
import listenerSetup from './hooks/listenerSetup';

// TODO! Give it a different name
let EventRegistry = {};

if (ExecutionEnvironment.canUseDOM) {

    let i = 0,
        type;

    for (; i < capturableEvents.length; i++) {

        type = capturableEvents[i];

        EventRegistry[type] = {
            type: type,
            bubbles: true,
            listenersCounter: 0,
            set: false
        };

        if (type === 'wheel' && (!isEventSupported('wheel'))) {

            if (isEventSupported('mousewheel')) {
                EventRegistry[type].type = 'mousewheel';
                EventRegistry[type].originalEvent = type;
            } else {
                // Firefox needs to capture a different mouse scroll event.
                // @see http://www.quirksmode.org/dom/events/tests/scroll.html
                EventRegistry[type].type = 'DOMMouseScroll';
                EventRegistry[type].originalEvent = type;
            }

        } else if (focusEvents[type]) {
            // IE has `focusin` and `focusout` events which bubble.
            // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html

            if (isEventSupported(focusEvents[type])) {

                EventRegistry[type].setup = function() {
                    let handler = listenerSetup(this.type, e => {
                        addRootDomEventListeners(e, this.type);
                    });
                    document.addEventListener(focusEvents[this.type], handler);
                };
            }
        }
    }

    // For non-bubbleable events - e.g. scroll - we are setting the events direcly on the node
    for (i = 0; i < nonBubbleableEvents.length; i++) {
        EventRegistry[nonBubbleableEvents[i]] = {
            type: type,
            bubbles: false,
            set: false
        };
    }
}

export default EventRegistry;