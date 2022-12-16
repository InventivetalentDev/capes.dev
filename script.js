const TYPE_LINKS = {
    "minecraft": "https://minecraft.net",
    "optifine": "https://optifine.net",
    "minecraftcapes": "https://minecraftcapes.net",
    "labymod": "https://www.labymod.net",
    "5zig": "https://5zigreborn.eu/",
    "tlauncher": "https://tlauncher.org/"
}

$("#cape-search-form").on("submit", e => {
    e.preventDefault();

    let player = $("#player-input").val();
    if (player.length < 1 || player.length > 36) return;

    $("#capes-container").empty();
    $(".message").hide();

    $("#message-loading").show();

    loadCapes(player);
});

$(document).ready(() => {
    let url = new URL(location);

    let player;
    if (url.hash.length > 3) {
        player = url.hash.substr(1);
    } else if (url.pathname.length > 3) {
        player = url.pathname.substr(1);
    } else if (url.searchParams.has("query")) {
        player = url.searchParams.get("query");
    }
    if (player) {
        $("#player-input").val(player);
        loadCapes(player);
    }

    $("#player-input").focus();

    $.ajax("https://api.capes.dev/stats")
        .done(data => {
            $("#cape-count").text("" + data.total);
            $("#player-count").text("" + data.players);
        });
})

function loadCapes(player) {
    $(".username").text(player);
    $("#cape-load-link").attr("href", "https://api.capes.dev/load/" + player.trim())
    $("#api-load-info").hide();
    $("#player-avatar").hide();
    $.ajax("https://api.capes.dev/load/" + player.trim())
        .done(data => {
            console.log(data);
            $(".message").hide();

            location.hash = player;

            let container = $("#capes-container");
            let count = 0;
            for (let key in data) {
                let cape = data[key];
                if (cape.exists) {
                    count++;
                    let alt = cape.playerName + '\'s ' + cape.type + ' cape';
                    let link = TYPE_LINKS.hasOwnProperty(cape.type) ? ('<a href="' + TYPE_LINKS[cape.type] + '" rel="nofollow" target="_blank">' + cape.type + '</a>') : cape.type;
                    container.append('<div class="col s6 m3 l2 cape">' +
                        '  <img src="' + (cape.animated ? cape.imageUrls.animated.front : cape.imageUrls.still.front) + '" alt="' + alt + '" title="' + alt + '" style="' + (cape.height < 100 ? "image-rendering: pixelated;" : "") + '">' +
                        '  <span class="cape-type">' + link + '</span>' +
                        '</div>');

                    location.hash = cape.playerName;
                }
                $("#player-avatar").attr("src", "https://crafatar.com/avatars/" + cape.player + "?size=64").show();
            }
            if (count <= 0) {
                $("#message-no-capes").show();
            } else {
                $("#api-load-info").show();
            }
        })
        .fail(err => {
            console.warn(err);
            $(".message").hide();
            if (err.status === 404) {
                $("#message-not-found").show();
            } else {
                $("#message-error").show();
            }
        })
}
