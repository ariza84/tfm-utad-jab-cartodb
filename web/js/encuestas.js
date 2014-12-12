$(document).ready(function() {

    cartodb.createVis('map', 'http://jab-utad.cartodb.com/api/v2/viz/982f4d6a-7d31-11e4-9c13-0e9d821ea90d/viz.json', {
        zoom: 11
    })
            .done(function(vis, layers) {
                var subLayer = vis.getLayers()[1];
                registerEvents(subLayer);
            });

    function registerEvents(subLayer) {
        $('input:checkbox').click(function(e) {
            var $box = $(this);
            if ($box.is(":checked")) {
                var group = "input:checkbox[name='" + $box.attr("name") + "']";
                $(group).prop("checked", false);
                $box.prop("checked", true);
            } else {
                $box.prop("checked", false);
            }
        });
        $('input[id=buscar]').click(function(e) {
            var checkbox = $("input:checkbox[name='quest']:checked");
            setQuery(checkbox, subLayer);
        });
    }

    function setQuery(checkbox, subLayer) {
        var query;
        if (checkbox.length > 0) {
            var check = checkbox.val();
            if (check === "1") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND p.pregunta3 = 3";
            }
            if (check === "2") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND p.pregunta3 = 2";
            }
            if (check === "3") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND p.pregunta4 = 1";
            }
            if (check === "4") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND (p.pregunta5 = 3 OR p.pregunta5 = 4)";
            }
            if (check === "5") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND p.pregunta5 = 2";
            }
            if (check === "6") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND p.pregunta5 = 1";
            }
            if (check === "7") {
                query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid AND p.pregunta1 = 2";
            }
            subLayer.getSubLayer(0).setSQL(query);
        } else {
            query = "SELECT w.* FROM tfm_utad_wearables w, tfm_utad_polls p WHERE w.userid = p.userid";
            subLayer.getSubLayer(0).setSQL(query);
        }
    }
});