function bombCostCalc(bullets, trigger, visible) {
    var cost = bullets;
    if (!visible) {
        cost *= 2;
    }
    switch (trigger) {
        case 0: //Any bullet hits
            cost += 0;
            break;
        case 1: //Bullet from player
            cost += 5;
            break;
        case 2: //Player hits that is not placer
            cost += 10;
            break;
    }
    return cost;
}