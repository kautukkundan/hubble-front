import React, { useEffect } from "react";
import Web3Modal from "web3modal";
import Web3 from "web3";
import Authereum from "authereum";
import WalletConnectProvider from "@walletconnect/web3-provider";

// hooks and services
import { Button } from "semantic-ui-react";
import { formatAccountString } from "../../utils/utils";
import { useStoreActions, useStoreState } from "../../store/globalStore";
import Tabs from "./Tabs";

// components, styles and UI

// interfaces
export interface EthereumAccountCardProps {}

const EthereumAccountCard: React.FunctionComponent<EthereumAccountCardProps> = () => {
  const { setAccount, setNetwork, setWeb3, setConnected } = useStoreActions(
    (actions) => actions
  );

  const { web3, account, network, connected } = useStoreState((state) => state);

  let providerOptions = {
    metamask: {
      id: "injected",
      name: "MetaMask",
      type: "injected",
      check: "isMetaMask",
      package: null,
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "INFURA_ID",
        network: "rinkeby",
        qrcodeModalOptions: {
          mobileLinks: [
            "rainbow",
            "metamask",
            "argent",
            "trust",
            "imtoken",
            "pillar",
          ],
        },
      },
    },
    authereum: {
      package: Authereum,
    },
  };

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

  const resetApp = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    setAccount("");
    setWeb3(null);
    setNetwork("");
    setConnected(false);
  };

  const subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => resetApp());
    provider.on("accountsChanged", async (accounts: string[]) => {
      await setAccount(accounts[0]);
    });
  };

  const onConnect = async () => {
    const provider = await web3Modal.connect();
    await subscribeProvider(provider);
    const web3: any = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const network = await web3.eth.net.getNetworkType();

    await setWeb3(web3);
    await setAccount(address);
    await setNetwork(network);
    await setConnected(true);
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      onConnect();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="main-card-right">
      <div className="header">
        <div className="account-details">
          <h4>Ethereum Account</h4>
          {connected ? (
            <p>
              ({network}) {formatAccountString(account)}
            </p>
          ) : (
            <p>Wallet not connected</p>
          )}
        </div>

        <Button
          onClick={connected ? resetApp : onConnect}
          className="custom-button"
          content={connected ? "Disconnect" : "connect wallet"}
          size="small"
          compact
        />
      </div>

      <Tabs />
    </div>
  );
};

export default EthereumAccountCard;
