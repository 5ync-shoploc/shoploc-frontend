import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';
import { useCurrentUser } from '@/lib/auth/CurrentUserContext';

const AppMenu = () => {
    const { user } = useCurrentUser();
    const isClient = user?.role === 'CLIENT';
    const isMerchant = user?.role === 'COMMERCANT';

    const model: AppMenuItem[] = [
        {
            label: 'Accueil',
            items: [{ label: 'Tableau de bord', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        // ---------- ShopLoc ----------
        // Chaque service ajoute ici les entrées de ses écrans (visibles selon le rôle de l'utilisateur).
        {
            label: 'Mes achats',
            visible: isClient,
            items: [
                { label: 'Mon panier', icon: 'pi pi-fw pi-shopping-cart', to: '/panier' },
                { label: 'Mes commandes', icon: 'pi pi-fw pi-list', to: '/commandes' }
            ]
        },
        {
            label: 'Mon commerce',
            visible: isMerchant,
            items: [{ label: 'Commandes à préparer', icon: 'pi pi-fw pi-inbox', to: '/commercant/commandes' }]
        },
        {
            label: 'Boutique',
            items: [{ label: 'Catalogue', icon: 'pi pi-fw pi-shopping-bag', to: '/catalogue' }]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
