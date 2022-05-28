import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import React, { useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import useIpfsFactory from '../hooks/use-ipfs-factory.js';
import useIpfs from '../hooks/use-ipfs.js';
import "../styles/GeneNetwork.css";

Cytoscape.use(COSEBilkent);
const elements = {
    nodes: [
        { data: { id: 'cat' } },
        { data: { id: 'bird' } },
        { data: { id: 'ladybug' } },
        { data: { id: 'aphid' } },
        { data: { id: 'rose' } },
        { data: { id: 'grasshopper' } },
        { data: { id: 'plant' } },
        { data: { id: 'wheat' } }
    ],
    edges: [
        { data: { source: 'cat', target: 'bird' } },
        { data: { source: 'bird', target: 'ladybug' } },
        { data: { source: 'bird', target: 'grasshopper' } },
        { data: { source: 'grasshopper', target: 'plant' } },
        { data: { source: 'grasshopper', target: 'wheat' } },
        { data: { source: 'ladybug', target: 'aphid' } },
        { data: { source: 'aphid', target: 'rose' } }
    ]
};

const style = [
    {
        selector: 'node',
        style: {
            'height': 80,
            'width': 80,
            'background-fit': 'cover',
            'border-color': '#000',
            'border-width': 3,
            'border-opacity': 0.5
        },
    },
    {
        selector: 'eating',
        style: {
            'border-color': 'red'
        }
    }, {
        selector: 'eater',
        style: {
            'border-width': 9
        }
    }, {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'width': 20,
            'height': 3,
            'target-arrow-shape': 'line',
            'line-color': '#ffaaaa',
            'target-arrow-color': '#ffaaaa'
        }
    }, {
        selector: '.bird',
        style: {
            'background-image': 'url(https://live.staticflickr.com/7272/7633179468_3e19e45a0c_b.jpg)'
        }
    }, {
        selector: 'cat',
        style: {
            'background-image': 'url(https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg)'
        }
    }, {
        selector: 'ladybug',
        style: {
            'background-image': 'url(https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg)'
        }
    }, {
        selector: 'aphid',
        style: {
            'background-image': 'url(https://live.staticflickr.com/8316/8003798443_32d01257c8_b.jpg)'
        }
    }, {
        selector: 'rose',
        style: {
            'background-image': 'url(https://live.staticflickr.com/5109/5817854163_eaccd688f5_b.jpg)'
        }
    }, {
        selector: 'grasshopper',
        style: {
            'background-image': 'url(https://live.staticflickr.com/6098/6224655456_f4c3c98589_b.jpg)'
        }
    }, {
        selector: 'plant',
        style: {
            'background-image': 'url(https://live.staticflickr.com/3866/14420309584_78bf471658_b.jpg)'
        }
    }, {
        selector: 'wheat',
        style: {
            'background-image': 'url(https://live.staticflickr.com/2660/3715569167_7e978e8319_b.jpg)'
        }
    }];

function GeneNetwork({ ...props }) {
    let ref;
    const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ['id'] })
    console.log(ipfs)
    const id = useIpfs(ipfs, 'id')
    const [version, setVersion] = useState(null)

    useEffect(() => {
        if (!ipfs) return;

        const getVersion = async () => {
            const nodeId = await ipfs.version();
            setVersion(nodeId);
        }

        getVersion();
    }, [ipfs])

    return (
        <div className="genealogy-network">
            {ipfsInitError && (
                <h6>
                    Error: {ipfsInitError.message || ipfsInitError}
                </h6>
            )}
            {(id || version) &&
                <div className='genealogy-container'>
                    <h6 className='genealogy-height' data-test='title'>Connected to IPFS {id && <IpfsId obj={id} keys={['id', 'agentVersion']} />}{version && <IpfsId obj={version} keys={['version']} />}</h6>

                    <CytoscapeComponent
                        elements={CytoscapeComponent.normalizeElements(elements)}
                        stylesheet={style}
                        style={{ width: '100%', height: '100%' }}
                        boxSelectionEnabled={true}
                        cy={(cy) => { ref = cy; }}
                        layout={{ name: 'cose-bilkent', directed: true, padding: 10 }} />
                </div>
            }

        </div>
    );
}

const IpfsId = ({ keys, obj }) => {
    if (!obj || !keys || keys.length === 0) return null
    return (
        <>
            {keys?.map((key) => (

                <small data-test={key}>{key}: {obj[key]}</small>

            ))}
        </>
    )
}

export default GeneNetwork;