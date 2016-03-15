(() => {
    'use strict';

    // layer group ids should not collide
    let groupIdCounter = 0;

    // jscs doesn't like enhanced object notation
    // jscs:disable requireSpacesInAnonymousFunctionExpression
    const LAYER_GROUP = (name, expanded = false) => {
        return {
            type: 'group',
            name,
            id: 'lg_' + groupIdCounter++,
            expanded,
            items: [],

            // TODO: add hook to set group options
            options: {
                visibility: {
                    value: 'on', // 'off', 'zoomIn', 'zoomOut'
                    enabled: true
                }
            },

            /**
             * Adds an item (layer or another group) to a layer group.
             * @param {Object} item     layer or group item to add
             * @param {Number} position position to insert the item at; defaults to the last position in the array
             */
            add(item, position = this.items.length) { // <- awesome! default is re-evaluated everytime the function is called
                item.parent = this;
                this.items.splice(position, 0, item);
            },

            /**
             * Removes a given item (layer or another group) from a layer group.
             * @param {Object} item     layer or group item to add
             * @return {Number}      index of the item before removal or -1 if the item is not in the group
             */
            remove(item) {
                const index = this.items.indexOf(item);
                if (index !== -1) {
                    delete item.parent;
                    this.items.splice(index, 1);
                }

                return index;
            }
        };
    };

    // jscs:enable requireSpacesInAnonymousFunctionExpression

    /**
     * @ngdoc service
     * @name legendService
     * @module app.geo
     * @requires dependencies
     * @description
     *
     * The `legendService` factory constructs the legend (auto or structured). `LayerRegistry` instantiates `LegendService` providing the current config, layers and legend containers.
     * This service also scrapes layer symbology.
     *
     */
    angular
        .module('app.geo')
        .factory('legendService', legendServiceFactory);

    function legendServiceFactory() {
        const legendSwitch = {
            structured: structuredLegendService,
            autopopulate: autoLegendService
        };

        return (config, ...args) => legendSwitch[config.legend.type](config, ...args);

        /**
         * Constrcuts and maintains autogenerated legend.
         * @param  {Object} config current config
         * @param  {Object} layers object with layers from `layerRegistry`
         * @param  {Array} legend array for legend item from `layerRegistry`
         * @return {Object}        instance of `legendService` for autogenerated legend
         */
        function autoLegendService(config, layers, legend) {
            const ref = {
                dataGroup: LAYER_GROUP('Data layers', true),
                imageGroup: LAYER_GROUP('Image layers', true),
                root: legend.items
            };

            // map layerTypes to default layergroups
            const layerTypeGroups = {
                esriDynamic: ref.dataGroup,
                esriFeature: ref.dataGroup,
                esriImage: ref.imageGroup,
                esriTile: ref.imageGroup,
                ogcWms: ref.imageGroup
            };

            const service = {
                addLayer,
                removeLayer,
                updateLegend
            };

            init();

            return service;

            /***/

            function init() {
                ref.root.push(ref.dataGroup, ref.imageGroup);
            }

            function updateLegend() {}

            /**
             * Add a provided layer to the appropriate group;
             * TODO: hide groups with no layers;
             * @param {Object} layer object from `layerRegistry` `layers` object
             */
            function addLayer(layer) {
                // TODO: remove; temp until scraper is done
                layer.state.symbology = [
                    {
                        icon: 'url',
                        name: 'hello'
                    }
                ];
                layerTypeGroups[layer.state.layerType].add(layer.state);
            }

            /**
             * Removes a provided layer from the appropriate group.
             * @param {Object} layer object from `layerRegistry` `layers` object
             */
            function removeLayer(layer) {
                layerTypeGroups[layer.state.layerType].remove(layer.state);
            }
        }

        function structuredLegendService() {

        }

        /*
        function getFeatureSymbology(url) {
            //snip off last slash if there
            const index = url.indexOf('/', url.length - 1);
            if (index > -1) {
                url = url.substring(0, idx - 1);
            } else {
                url = url;
            }
        }*/
    }
})();
