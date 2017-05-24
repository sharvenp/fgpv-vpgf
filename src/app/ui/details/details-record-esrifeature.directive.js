(() => {
    'use strict';

    /**
     * @module rvDetailsRecordEsrifeature
     * @memberof app.ui
     * @restrict E
     * @description
     *
     * The `rvDetailsRecordEsrifeature` directive renders the data content of details.
     *
     */
    angular
        .module('app.ui')
        .directive('rvDetailsRecordEsrifeature', rvDetailsRecordEsrifeature);

    /**
     * `rvDetailsRecordEsrifeature` directive body.
     *
     * @function rvDetailsRecordEsrifeature
     * @return {object} directive body
     */
    function rvDetailsRecordEsrifeature() {
        const directive = {
            restrict: 'E',
            templateUrl: 'app/ui/details/details-record-esrifeature.html',
            scope: {
                item: '=',
                mapPoint: '='
            },
            controller: Controller,
            controllerAs: 'self',
            bindToController: true
        };

        return directive;
    }

    function Controller($scope, events, mapService) {
        'ngInject';
        const self = this;

        self.initHighlight = initHighlight;
        self.toggleHighlight = toggleHighlight;

        let oidsAll = [];
        let oidsToHighlight = [];

        // redraw highlight when the already selected item is clicked in the details layer selector
        $scope.$on(events.rvHighlightDetailsItem, (event, item) => {
            if (item !== self.item) {
                return;
            }

            _redrawHighlight();
        });

        // watch for selected item changes; reset the highlight;
        $scope.$watch('self.item', newValue => {
            if (typeof newValue !== 'undefined') {
                oidsAll = [];
                oidsToHighlight = [];

                _redrawHighlight();
            }
        });

        return;

        /**
         * Highlights the feature with oid specified just after it renders on the page.
         *
         * @function initHighlight
         * @param {String} oid feature oid
         */
        function initHighlight(oid) {
            if (oidsAll.length === 0) {
                mapService.clearHighlight();
            }

            oidsAll.push(oid);
            _drawFeatureHighlight(oid)
        }

        /**
         * Highlights the feature with oid specified by adding it to the highlight layer.
         *
         * @function toggleHighlight
         * @param {String} oid id of the feature to be highlighted
         * @param {Boolean} value `true` if the oid should be highlighted; `false` if the oid should be dehighlighted
         */
        function toggleHighlight(oid, value) {

            const index = oidsToHighlight.indexOf(oid);
            if (value && index === -1) {
                oidsToHighlight.push(oid);
            } else if (index !== -1) {
                oidsToHighlight.splice(index, 1);
            }

            _redrawHighlight();
        }

        /**
         * Redraws highlight of the details feature set.
         * If there are some "expanded" features, only they are added to the highlight layer;
         * if there are no "expanded" features, all features are added to the highlight layer;
         * if there are not features, a marker is added at the click point to indicated absence of hits;
         *
         * @function _redrawHighlight
         * @private
         */
        function _redrawHighlight() {
            const oids = oidsToHighlight.length > 0 ? oidsToHighlight : oidsAll;

            mapService.clearHighlight();

            if (oids.length > 0) {
                oids.forEach(oid => _drawFeatureHighlight(oid));
            } else if (self.mapPoint) {
                mapService.addMarkerHighlight(self.mapPoint, true);
            }
        }

        /**
         * Adds a feature with the specified oid to the highlith layer.
         *
         * @function _drawFeatureHighlight
         * @private
         * @param {String} oid if of the feature to be highlighted
         */
        function _drawFeatureHighlight(oid) {
            const graphiBundlePromise = self.item.requester.proxy.fetchGraphic(oid);
            mapService.addGraphicHighlight(graphiBundlePromise, true);
        }
    }
})();
