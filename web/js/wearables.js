$(document).ready(function() {

    $('#from').datepicker({dateFormat: 'yy-mm-dd'});
    $('#to').datepicker({dateFormat: 'yy-mm-dd'});
    cartodb.createVis('map', 'http://jab-utad.cartodb.com/api/v2/viz/7d28fa60-7d32-11e4-b795-0e4fddd5de28/viz.json', {
        zoom: 11
    })
            .done(function(vis, layers) {
                var subLayer = vis.getLayers()[1];
                registerEvents(subLayer);
            });

    var sql = new cartodb.SQL({user: 'jab-utad', format: 'json'});
    sql.execute("SELECT DISTINCT(userstr) FROM tfm_utad_wearables ORDER BY userstr ASC")
            .done(function(data) {
                var combo_userstr = $('select[name=userstr]');
                combo_userstr[0].options[combo_userstr[0].options.length] = new Option("Selecciona un usuario", "");
                for (var i = 0; i < data.rows.length; i++) {
                    var value = data.rows[i].userstr;
                    combo_userstr[0].options[combo_userstr[0].options.length] = new Option(value, value);
                }
            });
    sql.execute("SELECT * FROM tfm_utad_districts ORDER BY name ASC")
            .done(function(data) {
                var combo_zone = $('select[name=zone]');
                combo_zone[0].options[combo_zone[0].options.length] = new Option("Selecciona una zona", "");
                for (var i = 0; i < data.rows.length; i++) {
                    var value = data.rows[i].id;
                    var text = data.rows[i].name;
                    combo_zone[0].options[combo_zone[0].options.length] = new Option(text, value);
                }
            });
    sql.execute("SELECT userstr, count(*) AS recorridos FROM (SELECT userstr, activity FROM tfm_utad_wearables GROUP BY userstr, activity) AS subrecorridos GROUP BY userstr ORDER BY recorridos DESC, userstr ASC LIMIT 10")
            .done(function(data) {
                var list_users = $('#list_users');
                list_users.append("<table id=\"table_users\" class=\"top10-users\"></table>");
                for (var i = 0; i < data.rows.length; i++) {
                    var userstr = data.rows[i].userstr;
                    var recorridos = data.rows[i].recorridos;
                    var table_users = $('#table_users');
                    table_users.append("<tr><td>" + userstr + "</td><td align=\"center\">" + recorridos + "</td></tr>");
                }
            });

    function registerEvents(subLayer) {
        $('input[id=buscar]').click(function(e) {
            var userstr = $('select[name=userstr]').val();
            var from = $('input[name=from]').val();
            var to = $('input[name=to]').val();
            var zone = $('select[name=zone]').val();
            setQuery(userstr, from, to, zone, subLayer);
        });
    }

    function setQuery(userstr, from, to, zone, subLayer) {
        if (zone !== "") {
            var sql = new cartodb.SQL({user: 'jab-utad', format: 'json'});
            sql.execute("SELECT * FROM tfm_utad_districts WHERE id = " + zone + "")
                    .done(function(data) {
                        var id = data.rows[0].id;
                        var latitude = data.rows[0].latitude;
                        var longitude = data.rows[0].longitude;
                        var coordinates = latitude + ' ' + longitude;
                        var query = "SELECT * FROM (SELECT *, ST_Distance_Spheroid(ST_GeomFromText('POINT(" + coordinates + ")',4326), ST_GeomFromText('POINT(' || latitude || ' ' || longitude || ')',4326), 'SPHEROID[\"WGS 84\",6378137,298.257223563]') AS distancia FROM tfm_utad_wearables ORDER BY distancia ASC) AS dist ";
                        query = addFilters(query, userstr, from, to);
                        if (userstr !== "" || from !== "" || to !== "") {
                            query = query + " AND distancia < 2000";
                        } else {
                            query = query + "WHERE distancia < 2000";
                        }
                        subLayer.getSubLayer(0).setSQL(query);
                    });
        } else {
            var query = "SELECT * FROM tfm_utad_wearables ";
            query = addFilters(query, userstr, from, to);
            subLayer.getSubLayer(0).setSQL(query);
        }
    }

    function addFilters(query, userstr, from, to) {
        var where = false;
        if (userstr !== "") {
            query = query + "WHERE userstr = '" + userstr + "'";
            where = true;
        }
        if (from !== "") {
            from = from + 'T00:00:00';
            if (where) {
                query = query + " AND created_date >= '" + from + "'";
            } else {
                query = query + "WHERE created_date >= '" + from + "'";
                where = true;
            }
        }
        if (to !== "") {
            to = to + 'T23:59:59';
            if (where) {
                query = query + " AND created_date <= '" + to + "'";
            } else {
                query = query + "WHERE created_date <= '" + to + "'";
                where = true;
            }
        }
        return query;
    }
});